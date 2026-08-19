import { ApiResponse, StorageSignedUrlResponse, StorageUploadOptions } from './types'

export class StorageBucketClient {
  private url: string
  private apiKey: string
  private bucketName: string

  constructor(url: string, apiKey: string, bucketName: string) {
    this.url = url.replace(/\/$/, '')
    this.apiKey = apiKey
    this.bucketName = bucketName
  }

  /** Direct browser / server upload via AWS S3 Presigned URL */
  async upload(
    path: string,
    file: Blob | ArrayBuffer | Uint8Array | any,
    options: StorageUploadOptions = {}
  ): Promise<ApiResponse<{ key: string }>> {
    try {
      const contentType = options.contentType || (file instanceof Blob ? file.type : 'application/octet-stream')
      const presignedRes = await fetch(`${this.url}/storage/upload-url`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucket: this.bucketName,
          filename: path,
          contentType,
        }),
      })

      const presignedJson = await presignedRes.json()
      if (!presignedRes.ok) {
        return { data: null, error: presignedJson.error || { code: 'UPLOAD_FAILED', message: 'Failed to get upload URL' } }
      }

      const { uploadUrl, objectKey } = presignedJson.data

      // Upload directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        return { data: null, error: { code: 'S3_ERROR', message: `S3 returned status ${uploadRes.status}` } }
      }

      return { data: { key: objectKey }, error: null }
    } catch (err: any) {
      return { data: null, error: { code: 'UPLOAD_ERROR', message: err.message } }
    }
  }

  /** Create a time-limited signed URL for viewing/downloading */
  async createSignedUrl(path: string, expiresIn: number = 3600): Promise<ApiResponse<StorageSignedUrlResponse>> {
    try {
      const res = await fetch(
        `${this.url}/storage/download-url?bucket=${encodeURIComponent(this.bucketName)}&key=${encodeURIComponent(path)}&expiresIn=${expiresIn}`,
        {
          method: 'GET',
          headers: {
            'apikey': this.apiKey,
          },
        }
      )
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: json.error || { code: 'SIGNED_URL_ERROR', message: res.statusText } }
      }
      return { data: json.data, error: null }
    } catch (err: any) {
      return { data: null, error: { code: 'NETWORK_ERROR', message: err.message } }
    }
  }
}

export class StorageClient {
  private url: string
  private apiKey: string

  constructor(url: string, apiKey: string) {
    this.url = url
    this.apiKey = apiKey
  }

  from(bucketName: string): StorageBucketClient {
    return new StorageBucketClient(this.url, this.apiKey, bucketName)
  }
}
