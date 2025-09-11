'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated')
      const email = localStorage.getItem('userEmail')
      
      if (authStatus === 'true' && email) {
        setIsAuthenticated(true)
        setUserEmail(email)
      } else {
        setIsAuthenticated(false)
        setUserEmail(null)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Redirect unauthenticated users to login page
    if (!isLoading && !isAuthenticated && pathname !== '/login' && pathname !== '/register') {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, accept any email/password
      // In a real app, validate against backend
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', email)
      setIsAuthenticated(true)
      setUserEmail(email)
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    setIsAuthenticated(false)
    setUserEmail(null)
    router.push('/login')
  }

  const value = {
    isAuthenticated,
    userEmail,
    login,
    logout,
    isLoading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}