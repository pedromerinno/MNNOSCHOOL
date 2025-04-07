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
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          instructor: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      empresas: {
        Row: {
          cor_principal: string | null
          created_at: string
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
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          display_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed: boolean
          course_id: string
          created_at: string
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
      user_empresa: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_belongs_to_company: {
        Args: {
          company_id: string
        }
        Returns: boolean
      }
      user_can_access_course: {
        Args: {
          course_id: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
