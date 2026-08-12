// Tipos do schema do Supabase (supabase/migrations). Escrito à mão porque o projeto ainda
// não foi provisionado no Supabase — assim que existir um project-id, regenere com:
//   supabase gen types typescript --project-id <id> > src/types/database.types.ts
// e reconcilie manualmente com os tipos de domínio abaixo se algo divergir.

export type ProfileRole = 'admin' | 'librarian' | 'student'
export type LoanStatus = 'borrowed' | 'returned' | 'overdue'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          role: ProfileRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          role?: ProfileRole
        }
        Update: {
          full_name?: string | null
          role?: ProfileRole
        }
        Relationships: []
      }
      authors: {
        Row: {
          id: string
          name: string
          biography: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          biography?: string | null
        }
        Update: {
          name?: string
          biography?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
        }
        Update: {
          name?: string
          description?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          id: string
          title: string
          isbn: string | null
          description: string | null
          cover_url: string | null
          publisher: string | null
          publication_year: number | null
          total_copies: number
          available_copies: number
          author_id: string | null
          category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          isbn?: string | null
          description?: string | null
          cover_url?: string | null
          publisher?: string | null
          publication_year?: number | null
          total_copies?: number
          available_copies?: number
          author_id?: string | null
          category_id?: string | null
        }
        Update: {
          title?: string
          isbn?: string | null
          description?: string | null
          cover_url?: string | null
          publisher?: string | null
          publication_year?: number | null
          total_copies?: number
          author_id?: string | null
          category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'books_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'authors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'books_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      students: {
        Row: {
          id: string
          name: string
          registration_number: string
          email: string | null
          phone: string | null
          class: string | null
          birth_date: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          registration_number: string
          email?: string | null
          phone?: string | null
          class?: string | null
          birth_date?: string | null
          active?: boolean
        }
        Update: {
          name?: string
          registration_number?: string
          email?: string | null
          phone?: string | null
          class?: string | null
          birth_date?: string | null
          active?: boolean
        }
        Relationships: []
      }
      loans: {
        Row: {
          id: string
          book_id: string
          student_id: string
          loan_date: string
          due_date: string
          return_date: string | null
          status: LoanStatus
          created_at: string
          updated_at: string
        }
        // o schema aceita insert/update diretos (refletindo o banco), mas o service layer
        // (services/loans.service.ts) só expõe as RPCs register_loan/return_loan, que aplicam
        // as regras de negócio — ver 008_create_functions.sql
        Insert: {
          id?: string
          book_id: string
          student_id: string
          loan_date?: string
          due_date: string
          return_date?: string | null
          status?: LoanStatus
        }
        Update: {
          return_date?: string | null
          status?: LoanStatus
        }
        Relationships: [
          {
            foreignKeyName: 'loans_book_id_fkey'
            columns: ['book_id']
            referencedRelation: 'books'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'loans_student_id_fkey'
            columns: ['student_id']
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          total_books: number
          total_copies: number
          available_copies: number
          total_students: number
          active_loans: number
          overdue_loans: number
          returned_loans: number
        }
        Relationships: []
      }
      active_loans: {
        Row: {
          id: string
          book_id: string
          book_title: string
          student_id: string
          student_name: string
          loan_date: string
          due_date: string
          status: LoanStatus
        }
        Relationships: []
      }
      overdue_loans: {
        Row: {
          id: string
          book_id: string
          book_title: string
          student_id: string
          student_name: string
          loan_date: string
          due_date: string
          days_overdue: number
        }
        Relationships: []
      }
    }
    Functions: {
      register_loan: {
        Args: { p_book_id: string; p_student_id: string; p_loan_days?: number }
        Returns: Database['public']['Tables']['loans']['Row']
      }
      return_loan: {
        Args: { p_loan_id: string }
        Returns: Database['public']['Tables']['loans']['Row']
      }
    }
  }
}
