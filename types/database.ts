export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      children: {
        Row: {
          id: string
          name: string
          date_of_birth: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          date_of_birth: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          date_of_birth?: string
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      co_parents: {
        Row: {
          id: string
          child_id: string
          user_id: string
          label: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          user_id: string
          label: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          user_id?: string
          label?: string
          color?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "co_parents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          id: string
          child_id: string
          created_by: string
          token: string
          used: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          created_by: string
          token?: string
          used?: boolean
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          created_by?: string
          token?: string
          used?: boolean
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          id: string
          child_id: string
          author_id: string
          storage_path: string
          caption: string | null
          taken_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          author_id: string
          storage_path: string
          caption?: string | null
          taken_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          author_id?: string
          storage_path?: string
          caption?: string | null
          taken_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          id: string
          child_id: string
          author_id: string
          title: string
          body: string
          entry_date: string | null
          mood: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          author_id: string
          title: string
          body: string
          entry_date?: string | null
          mood?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          author_id?: string
          title?: string
          body?: string
          entry_date?: string | null
          mood?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          id: string
          child_id: string
          author_id: string
          title: string
          description: string | null
          category: string
          icon: string | null
          milestone_date: string
          age_label: string | null
          celebrated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          author_id: string
          title: string
          description?: string | null
          category: string
          icon?: string | null
          milestone_date: string
          age_label?: string | null
          celebrated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          author_id?: string
          title?: string
          description?: string | null
          category?: string
          icon?: string | null
          milestone_date?: string
          age_label?: string | null
          celebrated?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      health_notes: {
        Row: {
          id: string
          child_id: string
          author_id: string
          type: string
          title: string
          detail: string | null
          note_date: string
          is_urgent: boolean
          is_resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          author_id: string
          type: string
          title: string
          detail?: string | null
          note_date: string
          is_urgent?: boolean
          is_resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          author_id?: string
          type?: string
          title?: string
          detail?: string | null
          note_date?: string
          is_urgent?: boolean
          is_resolved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_notes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_blocks: {
        Row: {
          id: string
          child_id: string
          parent_id: string
          date: string
          label: string | null
          is_handoff: boolean
          handoff_time: string | null
          handoff_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          parent_id: string
          date: string
          label?: string | null
          is_handoff?: boolean
          handoff_time?: string | null
          handoff_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          parent_id?: string
          date?: string
          label?: string | null
          is_handoff?: boolean
          handoff_time?: string | null
          handoff_note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_documents: {
        Row: {
          id: string
          child_id: string
          uploaded_by: string
          storage_path: string
          name: string
          type: string
          doc_date: string | null
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          uploaded_by: string
          storage_path: string
          name: string
          type: string
          doc_date?: string | null
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          uploaded_by?: string
          storage_path?: string
          name?: string
          type?: string
          doc_date?: string | null
          file_size?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_documents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      summaries: {
        Row: {
          id: string
          child_id: string
          period_start: string
          period_end: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          period_start: string
          period_end: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          period_start?: string
          period_end?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_suggestions: {
        Row: {
          id: string
          child_id: string
          title: string
          description: string | null
          category: string
          suggested_date: string | null
          source_context: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          title: string
          description?: string | null
          category: string
          suggested_date?: string | null
          source_context?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          title?: string
          description?: string | null
          category?: string
          suggested_date?: string | null
          source_context?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_suggestions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_child: {
        Args: { p_name: string; p_date_of_birth: string; p_label?: string }
        Returns: Database['public']['Tables']['children']['Row']
      }
      is_co_parent: {
        Args: { p_child_id: string }
        Returns: boolean
      }
    }
    Enums: {
      health_note_type: 'Medication' | 'Appointment' | 'Allergy' | 'Wellness' | 'Injury' | 'Dental' | 'Vision'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
