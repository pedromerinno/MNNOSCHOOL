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
      company_access: {
        Row: {
          company_id: string
          created_at: string
          id: string
          notes: string | null
          password: string
          tool_name: string
          url: string | null
          username: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          password: string
          tool_name: string
          url?: string | null
          username: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          password?: string
          tool_name?: string
          url?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      company_courses: {
        Row: {
          course_id: string
          created_at: string
          empresa_id: string
          id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          empresa_id: string
          id?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          empresa_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_courses_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      company_notices: {
        Row: {
          company_id: string
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_notices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      company_videos: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          order_index: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          order_index?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_videos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          instructor: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      discussion_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string
          discussion_id: string
          id: string
          image_url: string | null
          video_url: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          image_url?: string | null
          video_url?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          image_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          author_id: string
          company_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          status: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_id: string
          company_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          status?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_id?: string
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cor_principal: string | null
          created_at: string
          created_by: string | null
          descricao_video: string | null
          frase_institucional: string | null
          historia: string | null
          id: string
          logo: string | null
          missao: string | null
          nome: string
          updated_at: string
          valores: string | null
          video_institucional: string | null
        }
        Insert: {
          cor_principal?: string | null
          created_at?: string
          created_by?: string | null
          descricao_video?: string | null
          frase_institucional?: string | null
          historia?: string | null
          id?: string
          logo?: string | null
          missao?: string | null
          nome: string
          updated_at?: string
          valores?: string | null
          video_institucional?: string | null
        }
        Update: {
          cor_principal?: string | null
          created_at?: string
          created_by?: string | null
          descricao_video?: string | null
          frase_institucional?: string | null
          historia?: string | null
          id?: string
          logo?: string | null
          missao?: string | null
          nome?: string
          updated_at?: string
          valores?: string | null
          video_institucional?: string | null
        }
        Relationships: []
      }
      job_roles: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          expectations: string | null
          id: string
          order_index: number
          requirements: string | null
          responsibilities: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          expectations?: string | null
          id?: string
          order_index?: number
          requirements?: string | null
          responsibilities?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          expectations?: string | null
          id?: string
          order_index?: number
          requirements?: string | null
          responsibilities?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          completed: boolean | null
          content: string | null
          course_id: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          order_index: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          content?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          order_index: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          content?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          order_index?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          notice_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          notice_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          notice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notice_companies_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "company_notices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          cargo_id: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          interesses: string[] | null
          is_admin: boolean | null
          primeiro_login: boolean | null
          super_admin: boolean | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          cargo_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          interesses?: string[] | null
          is_admin?: boolean | null
          primeiro_login?: boolean | null
          super_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          cargo_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          interesses?: string[] | null
          is_admin?: boolean | null
          primeiro_login?: boolean | null
          super_admin?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          media_type: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          media_type?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          media_type?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed: boolean
          course_id: string
          created_at: string
          favorite: boolean
          id: string
          last_accessed: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_id: string
          created_at?: string
          favorite?: boolean
          id?: string
          last_accessed?: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          course_id?: string
          created_at?: string
          favorite?: boolean
          id?: string
          last_accessed?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          company_id: string
          description: string | null
          document_type: string
          file_path: string
          file_type: string
          id: string
          name: string
          uploaded_at: string
          uploaded_by: string
          user_id: string
        }
        Insert: {
          company_id: string
          description?: string | null
          document_type: string
          file_path: string
          file_type: string
          id?: string
          name: string
          uploaded_at?: string
          uploaded_by: string
          user_id: string
        }
        Update: {
          company_id?: string
          description?: string | null
          document_type?: string
          file_path?: string
          file_type?: string
          id?: string
          name?: string
          uploaded_at?: string
          uploaded_by?: string
          user_id?: string
        }
        Relationships: []
      }
      user_empresa: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          is_admin: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          is_admin?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          is_admin?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_empresa_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedbacks: {
        Row: {
          company_id: string
          content: string
          created_at: string | null
          from_user_id: string
          id: string
          to_user_id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string | null
          from_user_id: string
          id?: string
          to_user_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string | null
          from_user_id?: string
          id?: string
          to_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedbacks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          last_accessed: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          last_accessed?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          last_accessed?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          id: string
          pinned: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          company_id: string
          content: string
          created_at: string
          id: string
          read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_companies_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          cor_principal: string | null
          created_at: string
          created_by: string | null
          descricao_video: string | null
          frase_institucional: string | null
          historia: string | null
          id: string
          logo: string | null
          missao: string | null
          nome: string
          updated_at: string
          valores: string | null
          video_institucional: string | null
        }[]
      }
      get_all_users_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar: string | null
          cargo_id: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          interesses: string[] | null
          is_admin: boolean | null
          primeiro_login: boolean | null
          super_admin: boolean | null
          updated_at: string
        }[]
      }
      get_is_admin_secure: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_is_super_admin_secure: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_user_companies: {
        Args: { user_id: string }
        Returns: {
          cor_principal: string | null
          created_at: string
          created_by: string | null
          descricao_video: string | null
          frase_institucional: string | null
          historia: string | null
          id: string
          logo: string | null
          missao: string | null
          nome: string
          updated_at: string
          valores: string | null
          video_institucional: string | null
        }[]
      }
      get_user_companies_for_admin: {
        Args: { current_user_id: string }
        Returns: {
          cor_principal: string | null
          created_at: string
          created_by: string | null
          descricao_video: string | null
          frase_institucional: string | null
          historia: string | null
          id: string
          logo: string | null
          missao: string | null
          nome: string
          updated_at: string
          valores: string | null
          video_institucional: string | null
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin_or_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      user_belongs_to_company: {
        Args: { company_id: string } | { user_id: string; company_id: string }
        Returns: boolean
      }
      user_belongs_to_company_of_profile: {
        Args: { profile_id: string }
        Returns: boolean
      }
      user_can_access_course: {
        Args: { course_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
