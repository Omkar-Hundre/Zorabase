'use client'

import { useState, useTransition } from 'react'
import {
  type StorageBucket,
  type StorageObject,
  createBucket,
  deleteBucket,
  getUploadUrl,
  registerUploadedObject,
  getDownloadUrl,
  deleteObject,
  listObjects,
} from '@/app/dashboard/[projectId]/storage/actions'

interface Props {
  projectId: string
  initialBuckets: StorageBucket[]
  s3Health: { ok: boolean; message: string }
}

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function StorageView({ projectId, initialBuckets, s3Health }: Props) {
  const [buckets, setBuckets] = useState<StorageBucket[]>(initialBuckets)
  const [selectedBucket, setSelectedBucket] = useState<StorageBucket | null>(initialBuckets[0] || null)
  const [objects, setObjects] = useState<StorageObject[]>([])
  const [loadingObjects, setLoadingObjects] = useState(false)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newBucketName, setNewBucketName] = useState('')
  const [newBucketPublic, setNewBucketPublic] = useState(false)
  const [creatingBucket, setCreatingBucket] = useState(false)
  const [bucketError, setBucketError] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  // Fetch objects when selected bucket changes
  async function handleSelectBucket(bucket: StorageBucket) {
    setSelectedBucket(bucket)
    setLoadingObjects(true)
    try {
      const items = await listObjects(projectId, bucket.name)
      setObjects(items)
    } finally {
      setLoadingObjects(false)
    }
  }

  // Handle Bucket Creation
  async function handleCreateBucket(e: React.FormEvent) {
    e.preventDefault()
    setCreatingBucket(true)
    setBucketError(null)

    const res = await createBucket(projectId, newBucketName, newBucketPublic)
    if (res.error) {
      setBucketError(res.error)
      setCreatingBucket(false)
      return
    }

    if (res.bucket) {
      const updated = [res.bucket, ...buckets]
      setBuckets(updated)
      setSelectedBucket(res.bucket)
      setObjects([])
      setCreateDialogOpen(false)
      setNewBucketName('')
      setNewBucketPublic(false)
    }
    setCreatingBucket(false)
  }

  // Handle Bucket Deletion
  async function handleDeleteBucket(bucketName: string) {
    if (!confirm(`Are you sure you want to delete bucket "${bucketName}" and all its files?`)) return

    startTransition(async () => {
      await deleteBucket(projectId, bucketName)
      const filtered = buckets.filter((b) => b.name !== bucketName)
      setBuckets(filtered)
      if (selectedBucket?.name === bucketName) {
        setSelectedBucket(filtered[0] || null)
        if (filtered[0]) {
          const items = await listObjects(projectId, filtered[0].name)
          setObjects(items)
        } else {
          setObjects([])
        }
      }
    })
  }

  // Direct S3 Upload via Presigned URL
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selectedBucket) return

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // 1. Get presigned upload URL
      const { uploadUrl, objectKey, error } = await getUploadUrl(
        projectId,
        selectedBucket.name,
        file.name,
        file.type
      )

      if (error || !uploadUrl || !objectKey) {
        throw new Error(error || 'Failed to generate upload URL')
      }

      // 2. Direct upload to AWS S3 using XMLHttpRequest for real progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl, true)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during S3 upload'))
        xhr.send(file)
      })

      // 3. Register object metadata in database
      const { object: newObj, error: regError } = await registerUploadedObject(
        projectId,
        selectedBucket.name,
        objectKey,
        file.type,
        file.size
      )

      if (regError || !newObj) {
        console.warn('Object uploaded to S3 but metadata registration had issue', regError)
      } else {
        setObjects((prev) => [newObj, ...prev])
      }
    } catch (err: any) {
      console.error('Upload failed:', err)
      setUploadError(err.message || 'File upload failed.')
    } finally {
      setUploading(false)
      setUploadProgress(null)
      e.target.value = ''
    }
  }

  // Handle Download URL
  async function handleDownload(objectKey: string) {
    const { downloadUrl, error } = await getDownloadUrl(objectKey)
    if (error || !downloadUrl) {
      alert('Could not generate download URL')
      return
    }
    window.open(downloadUrl, '_blank')
  }

  // Handle Copy Presigned URL
  async function handleCopySignedUrl(objectKey: string) {
    const { downloadUrl, error } = await getDownloadUrl(objectKey)
    if (error || !downloadUrl) {
      alert('Could not generate signed URL')
      return
    }
    await navigator.clipboard.writeText(downloadUrl)
    setCopiedKey(objectKey)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Handle Delete Object
  async function handleDeleteObject(objectKey: string) {
    if (!selectedBucket || !confirm('Delete this file from S3?')) return
    await deleteObject(projectId, selectedBucket.name, objectKey)
    setObjects((prev) => prev.filter((o) => o.object_key !== objectKey))
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Storage Buckets</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Object storage powered directly by AWS S3 (eu-north-1) with presigned URLs.
          </p>
        </div>

        {/* AWS S3 status badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-white/[0.08] bg-white/[0.02]">
            <span className={`w-2 h-2 rounded-full ${s3Health.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className="text-zinc-300 font-mono text-[11px]">AWS S3: {s3Health.ok ? 'zorabase (eu-north-1)' : 'Disconnected'}</span>
          </div>
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Bucket
          </button>
        </div>
      </div>

      {/* Main Grid: Buckets sidebar + Objects view */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Bucket list */}
        <div className="md:col-span-1 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-1">Buckets</span>
          {buckets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center">
              <p className="text-xs text-zinc-500">No buckets yet</p>
              <button
                onClick={() => setCreateDialogOpen(true)}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Create one
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {buckets.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBucket(b)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedBucket?.id === b.id
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-white font-medium'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={selectedBucket?.id === b.id ? 'text-indigo-400' : 'text-zinc-500'}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="truncate">{b.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border ${b.is_public ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-zinc-500 border-zinc-700'}`}>
                      {b.is_public ? 'Public' : 'Private'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBucket(b.name)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity p-1"
                      title="Delete bucket"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objects inside selected bucket */}
        <div className="md:col-span-3">
          {selectedBucket ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-5">
              {/* Bucket details & Upload control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-zinc-100">{selectedBucket.name}</h2>
                    <span className="text-[10px] text-zinc-500 font-mono">({objects.length} files)</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Path prefix: <code className="text-zinc-400 font-mono">projects/{projectId}/{selectedBucket.name}/</code>
                  </p>
                </div>

                {/* Upload button */}
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-white/[0.08] hover:bg-white/[0.12] text-xs font-medium text-white cursor-pointer border border-white/[0.1] transition-all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{uploading ? `Uploading ${uploadProgress}%...` : 'Upload File'}</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Upload Progress & Errors */}
              {uploading && (
                <div className="space-y-1.5 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                  <div className="flex justify-between text-xs text-indigo-300 font-medium">
                    <span>Direct Presigned Upload to S3</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-300 rounded-lg">
                  {uploadError}
                </div>
              )}

              {/* Objects Table */}
              {loadingObjects ? (
                <div className="py-12 text-center text-xs text-zinc-500">Loading files...</div>
              ) : objects.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/[0.06] rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600 mx-auto mb-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-xs font-medium text-zinc-400">No objects uploaded in this bucket</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Click "Upload File" above or use the SDK to upload directly.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-zinc-500 font-medium">
                        <th className="py-2.5 px-3">File Key</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Uploaded</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {objects.map((obj) => {
                        const filename = obj.object_key.split('/').pop() || obj.object_key
                        const uploadedDate = new Date(obj.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })

                        return (
                          <tr key={obj.id} className="hover:bg-white/[0.02] text-zinc-300">
                            <td className="py-3 px-3">
                              <span className="font-mono text-zinc-200 block truncate max-w-xs" title={obj.object_key}>
                                {filename}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-zinc-400 font-mono">{formatBytes(obj.size_bytes)}</td>
                            <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">{obj.mime_type || 'binary'}</td>
                            <td className="py-3 px-3 text-zinc-500">{uploadedDate}</td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleCopySignedUrl(obj.object_key)}
                                  className="h-6 px-2 text-[11px] rounded border border-white/[0.08] hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200"
                                  title="Copy signed download URL (valid 1hr)"
                                >
                                  {copiedKey === obj.object_key ? 'Copied' : 'Copy URL'}
                                </button>
                                <button
                                  onClick={() => handleDownload(obj.object_key)}
                                  className="h-6 px-2 text-[11px] rounded border border-white/[0.08] hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200"
                                  title="Download directly"
                                >
                                  Download
                                </button>
                                <button
                                  onClick={() => handleDeleteObject(obj.object_key)}
                                  className="h-6 px-1.5 text-[11px] rounded border border-white/[0.08] hover:bg-red-500/10 text-zinc-500 hover:text-red-400"
                                  title="Delete from S3"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/[0.08] p-12 text-center text-zinc-500 text-xs">
              Select or create a bucket to view and manage files.
            </div>
          )}
        </div>
      </div>

      {/* Code Snippet for SDK Storage */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">SDK Storage Integration</h3>
        <p className="text-xs text-zinc-500">
          The client uploads files directly to AWS S3 using presigned URLs without putting bandwidth load on your API server.
        </p>
        <pre className="text-xs font-mono text-zinc-300 bg-[#08080a] p-4 rounded-lg overflow-x-auto leading-relaxed border border-white/[0.05]">
{`// 1. Upload file directly to S3
const file = event.target.files[0]
const { data, error } = await zorabase.storage
  .from('${selectedBucket?.name || 'avatars'}')
  .upload(\`users/\${userId}/\${file.name}\`, file)

// 2. Generate signed download URL
const { data: signed } = await zorabase.storage
  .from('${selectedBucket?.name || 'avatars'}')
  .createSignedUrl('users/user_123/profile.png', 3600)`}
        </pre>
      </div>

      {/* New Bucket Dialog Modal */}
      {createDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateDialogOpen(false)} />
          <div className="relative w-full max-w-md bg-[#111113] border border-white/[0.08] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-zinc-100">Create Storage Bucket</h2>
              <button onClick={() => setCreateDialogOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateBucket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Bucket Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. avatars, documents, images"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bucket-public"
                  checked={newBucketPublic}
                  onChange={(e) => setNewBucketPublic(e.target.checked)}
                  className="rounded border-zinc-700 bg-white/[0.05] text-indigo-600 focus:ring-0"
                />
                <label htmlFor="bucket-public" className="text-xs text-zinc-400 cursor-pointer">
                  Public bucket (files can be read without auth tokens)
                </label>
              </div>

              {bucketError && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-2.5">
                  {bucketError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1 h-9 rounded-lg border border-white/[0.08] text-xs font-medium text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBucket}
                  className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white"
                >
                  {creatingBucket ? 'Creating...' : 'Create Bucket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
