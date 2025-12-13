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
            ambassador_details: {
                Row: {
                    user_id: string
                    referral_code: string
                    niche: string[] | null
                    commission_rate: number
                    total_earnings: number
                    created_at: string
                }
                Insert: {
                    user_id: string
                    referral_code: string
                    niche?: string[] | null
                    commission_rate?: number
                    total_earnings?: number
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    referral_code?: string
                    niche?: string[] | null
                    commission_rate?: number
                    total_earnings?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ambassador_details_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            bookings: {
                Row: {
                    id: string
                    user_id: string | null
                    service_id: string | null
                    status: Database["public"]["Enums"]["booking_status"]
                    total_price: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    service_id?: string | null
                    status?: Database["public"]["Enums"]["booking_status"]
                    total_price?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    service_id?: string | null
                    status?: Database["public"]["Enums"]["booking_status"]
                    total_price?: number | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
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
                Relationships: []
            }
            post_comments: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    parent_comment_id: string | null
                    content: string
                    likes_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    parent_comment_id?: string | null
                    content: string
                    likes_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    parent_comment_id?: string | null
                    content?: string
                    likes_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "post_comments_parent_comment_id_fkey"
                        columns: ["parent_comment_id"]
                        isOneToOne: false
                        referencedRelation: "post_comments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_comments_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            post_likes: {
                Row: {
                    id: string
                    user_id: string
                    post_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    post_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    post_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "post_likes_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_likes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            posts: {
                Row: {
                    id: string
                    user_id: string | null
                    video_url: string
                    thumbnail_url: string | null
                    description: string | null
                    likes_count: number
                    linked_service_id: string | null
                    destination_id: string | null
                    location_tag: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    video_url: string
                    thumbnail_url?: string | null
                    description?: string | null
                    likes_count?: number
                    linked_service_id?: string | null
                    destination_id?: string | null
                    location_tag?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    video_url?: string
                    thumbnail_url?: string | null
                    description?: string | null
                    likes_count?: number
                    linked_service_id?: string | null
                    destination_id?: string | null
                    location_tag?: Json | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "posts_destination_id_fkey"
                        columns: ["destination_id"]
                        isOneToOne: false
                        referencedRelation: "destinations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "posts_linked_service_id_fkey"
                        columns: ["linked_service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "posts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    id: string
                    username: string
                    full_name: string | null
                    role: Database["public"]["Enums"]["user_role"]
                    avatar_url: string | null
                    km_container: number
                    is_verified: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    full_name?: string | null
                    role?: Database["public"]["Enums"]["user_role"]
                    avatar_url?: string | null
                    km_container?: number
                    is_verified?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    full_name?: string | null
                    role?: Database["public"]["Enums"]["user_role"]
                    avatar_url?: string | null
                    km_container?: number
                    is_verified?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            referrals: {
                Row: {
                    id: string
                    ambassador_id: string | null
                    referred_user_id: string | null
                    status: Database["public"]["Enums"]["referral_status"]
                    created_at: string
                }
                Insert: {
                    id?: string
                    ambassador_id?: string | null
                    referred_user_id?: string | null
                    status?: Database["public"]["Enums"]["referral_status"]
                    created_at?: string
                }
                Update: {
                    id?: string
                    ambassador_id?: string | null
                    referred_user_id?: string | null
                    status?: Database["public"]["Enums"]["referral_status"]
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "referrals_ambassador_id_fkey"
                        columns: ["ambassador_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "referrals_referred_user_id_fkey"
                        columns: ["referred_user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            service_reviews: {
                Row: {
                    id: string
                    service_id: string
                    user_id: string
                    booking_id: string | null
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    service_id: string
                    user_id: string
                    booking_id?: string | null
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    service_id?: string
                    user_id?: string
                    booking_id?: string | null
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "service_reviews_booking_id_fkey"
                        columns: ["booking_id"]
                        isOneToOne: true
                        referencedRelation: "bookings"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "service_reviews_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "service_reviews_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            services: {
                Row: {
                    id: string
                    provider_id: string | null
                    title: string
                    description: string | null
                    service_type: Database["public"]["Enums"]["service_type"]
                    price_mxn: number
                    available: boolean
                    images: string[] | null
                    rating: number
                    total_reviews: number
                    duration_hours: number | null
                    max_capacity: number | null
                    location: Json | null
                    location_name: string | null
                    location_address: string | null
                    location_place_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    provider_id?: string | null
                    title: string
                    description?: string | null
                    service_type: Database["public"]["Enums"]["service_type"]
                    price_mxn: number
                    available?: boolean
                    images?: string[] | null
                    rating?: number
                    total_reviews?: number
                    duration_hours?: number | null
                    max_capacity?: number | null
                    location?: Json | null
                    location_name?: string | null
                    location_address?: string | null
                    location_place_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    provider_id?: string | null
                    title?: string
                    description?: string | null
                    service_type?: Database["public"]["Enums"]["service_type"]
                    price_mxn?: number
                    available?: boolean
                    images?: string[] | null
                    rating?: number
                    total_reviews?: number
                    duration_hours?: number | null
                    max_capacity?: number | null
                    location?: Json | null
                    location_name?: string | null
                    location_address?: string | null
                    location_place_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "services_provider_id_fkey"
                        columns: ["provider_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            site_settings: {
                Row: {
                    id: number
                    site_name: string | null
                    site_description: string | null
                    logo_url: string | null
                    contact_email: string | null
                    contact_phone: string | null
                    maintenance_mode: boolean | null
                    updated_at: string
                }
                Insert: {
                    id?: number
                    site_name?: string | null
                    site_description?: string | null
                    logo_url?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    maintenance_mode?: boolean | null
                    updated_at?: string
                }
                Update: {
                    id?: number
                    site_name?: string | null
                    site_description?: string | null
                    logo_url?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    maintenance_mode?: boolean | null
                    updated_at?: string
                }
                Relationships: []
            }
            spatial_ref_sys: {
                Row: {
                    srid: number
                    auth_name: string | null
                    auth_srid: number | null
                    srtext: string | null
                    proj4text: string | null
                }
                Insert: {
                    srid: number
                    auth_name?: string | null
                    auth_srid?: number | null
                    srtext?: string | null
                    proj4text?: string | null
                }
                Update: {
                    srid?: number
                    auth_name?: string | null
                    auth_srid?: number | null
                    srtext?: string | null
                    proj4text?: string | null
                }
                Relationships: []
            }
            transactions: {
                Row: {
                    id: string
                    wallet_id: string | null
                    amount: number
                    type: Database["public"]["Enums"]["transaction_type"]
                    reference_id: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    wallet_id?: string | null
                    amount: number
                    type: Database["public"]["Enums"]["transaction_type"]
                    reference_id?: string | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    wallet_id?: string | null
                    amount?: number
                    type?: Database["public"]["Enums"]["transaction_type"]
                    reference_id?: string | null
                    description?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "transactions_wallet_id_fkey"
                        columns: ["wallet_id"]
                        isOneToOne: false
                        referencedRelation: "wallets"
                        referencedColumns: ["id"]
                    }
                ]
            }
            wallets: {
                Row: {
                    id: string
                    user_id: string
                    balance: number
                    currency_code: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    balance?: number
                    currency_code?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    balance?: number
                    currency_code?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "wallets_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            booking_status: "pending" | "confirmed" | "cancelled" | "completed"
            referral_status: "pending" | "approved" | "rejected"
            user_role: "traveler" | "provider" | "admin" | "ambassador"
            service_type: "experience" | "tour" | "lodging" | "transport"
            transaction_type: "deposit" | "withdrawal"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
