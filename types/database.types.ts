export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string
                    full_name: string | null
                    role: 'traveler' | 'provider' | 'admin' | 'ambassador'
                    avatar_url: string | null
                    km_container: number
                    is_verified: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    username: string
                    full_name?: string | null
                    role?: 'traveler' | 'provider' | 'admin' | 'ambassador'
                    avatar_url?: string | null
                    km_container?: number
                    is_verified?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    full_name?: string | null
                    role?: 'traveler' | 'provider' | 'admin' | 'ambassador'
                    avatar_url?: string | null
                    km_container?: number
                    is_verified?: boolean
                    created_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    provider_id: string | null
                    title: string
                    description: string | null
                    service_type: string
                    price_mxn: number
                    location: any // USER-DEFINED
                    available: boolean
                    created_at: string
                    images: string[] | null
                    rating: number
                    total_reviews: number
                    duration_hours: number | null
                    max_capacity: number | null
                    updated_at: string
                    location_name: string | null
                    location_address: string | null
                    location_coords: any // USER-DEFINED
                    location_place_id: string | null
                    // approved removed as it's not in schema. Logic updated to use 'available'.
                }
                Insert: {
                    id?: string
                    provider_id?: string | null
                    title: string
                    description?: string | null
                    service_type: string
                    price_mxn: number
                    location?: any
                    available?: boolean
                    created_at?: string
                    images?: string[] | null
                    rating?: number
                    total_reviews?: number
                    duration_hours?: number | null
                    max_capacity?: number | null
                    updated_at?: string
                    location_name?: string | null
                    location_address?: string | null
                    location_coords?: any
                    location_place_id?: string | null
                }
                Update: {
                    id?: string
                    provider_id?: string | null
                    title?: string
                    description?: string | null
                    service_type?: string
                    price_mxn?: number
                    location?: any
                    available?: boolean
                    created_at?: string
                    images?: string[] | null
                    rating?: number
                    total_reviews?: number
                    duration_hours?: number | null
                    max_capacity?: number | null
                    updated_at?: string
                    location_name?: string | null
                    location_address?: string | null
                    location_coords?: any
                    location_place_id?: string | null
                }
            }
            destinations: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    place_id: string | null
                    address: string | null
                    city: string | null
                    state: string | null
                    country: string | null
                    latitude: number
                    longitude: number
                    category: string | null
                    posts_count: number
                    views_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    place_id?: string | null
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    latitude: number
                    longitude: number
                    category?: string | null
                    posts_count?: number
                    views_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    place_id?: string | null
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    latitude?: number
                    longitude?: number
                    category?: string | null
                    posts_count?: number
                    views_count?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    user_id: string | null
                    video_url: string
                    thumbnail_url: string | null
                    location_tag: any // USER-DEFINED
                    description: string | null
                    likes_count: number
                    linked_service_id: string | null
                    destination_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    video_url: string
                    thumbnail_url?: string | null
                    location_tag?: any
                    description?: string | null
                    likes_count?: number
                    linked_service_id?: string | null
                    destination_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    video_url?: string
                    thumbnail_url?: string | null
                    location_tag?: any
                    description?: string | null
                    likes_count?: number
                    linked_service_id?: string | null
                    destination_id?: string | null
                    created_at?: string
                }
            }
            wallets: {
                Row: {
                    id: string
                    user_id: string
                    balance: number
                    currency_code: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    balance?: number
                    currency_code?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    balance?: number
                    currency_code?: string
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    wallet_id: string | null
                    amount: number
                    type: string
                    reference_id: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    wallet_id?: string | null
                    amount: number
                    type: string
                    reference_id?: string | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    wallet_id?: string | null
                    amount?: number
                    type?: string
                    reference_id?: string | null
                    description?: string | null
                    created_at?: string
                }
            }
        }
    }
}
