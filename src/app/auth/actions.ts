'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (err: any) {
    if (err && typeof err === 'object' && err.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error("Login action error:", err);
    return { error: err.message || "Failed to connect to authentication server. Please check your internet connection." };
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })

    if (error) {
      return { error: error.message }
    }

    if (authData.user) {
      try {
        await prisma.user.upsert({
          where: { id: authData.user.id },
          update: {
            name: `${firstName} ${lastName}`,
          },
          create: {
            id: authData.user.id,
            name: `${firstName} ${lastName}`,
            email: email,
          }
        })
      } catch (e) {
        console.error("Failed to create public user record", e)
      }
    }

    redirect('/auth/verify-email?email=' + encodeURIComponent(email))
  } catch (err: any) {
    if (err && typeof err === 'object' && err.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error("Signup action error:", err);
    return { error: err.message || "Failed to connect to authentication server. Please check your internet connection." };
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
