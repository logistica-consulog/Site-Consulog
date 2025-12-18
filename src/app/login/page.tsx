'use client'

import { LoginForm } from '@/components/forms/LoginForm'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Warehouse image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-800/20 z-10" />
        <Image
          src="/images/warehouse.jpg"
          alt="Armazém Logístico"
          fill
          sizes="(max-width: 1023px) 0vw, 50vw"
          className="object-cover"
          priority
        />
        <div className="absolute bottom-8 left-8 z-20 text-white">
          <h1 className="text-4xl font-bold mb-2">Consulog</h1>
          <p className="text-lg opacity-90">
            Sistema de Gestão Logística Inteligente
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Consulog</h1>
            <p className="text-gray-600">Sistema de Gestão Logística</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Fazer Login
              </h2>
              <p className="text-gray-600">
                Acesse sua conta para continuar
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}