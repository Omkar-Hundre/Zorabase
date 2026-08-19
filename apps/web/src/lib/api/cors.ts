import { NextResponse } from 'next/server'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-api-key',
  'Access-Control-Max-Age': '86400',
}

export function handleCorsPreflight() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export function jsonWithCors(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  })
}
