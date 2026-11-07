import type { Db } from '../../db/client'
import {
  projectInquiries,
  type NewProjectInquiry
} from '../../db/schema'
import { AppError } from '../../shared/errors'

type CreateInquiryInput = Pick<
  NewProjectInquiry,
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'companyName'
  | 'companyEmail'
  | 'description'
  | 'status'
  | 'createdAt'
>

export function createInquiriesRepository(db: Db) {
  return {
    create(input: CreateInquiryInput): { id: number; createdAt: string } {
      const row = db
        .insert(projectInquiries)
        .values(input)
        .returning({
          id: projectInquiries.id,
          createdAt: projectInquiries.createdAt
        })
        .get()

      if (!row) {
        throw new AppError(
          500,
          'INTERNAL_ERROR',
          'Failed to create inquiry'
        )
      }

      return row
    }
  }
}
