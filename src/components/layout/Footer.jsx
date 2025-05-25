'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 right-0 left-0 z-40 h-16 bg-white border-t">
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Image src="/hagzz-logo.png" alt="HAGZZ GO" width={32} height={32} className="h-8" />
          <p className="text-sm text-gray-600">
            © {currentYear} HAGZZ GO جميع الحقوق محفوظة
          </p>
        </div>

        <div className="flex items-center space-x-6 space-x-reverse">
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
            عن المنصة
          </Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
            اتصل بنا
          </Link>
          <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
            سياسة الخصوصية
          </Link>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <a href="#" className="text-gray-600 hover:text-blue-600">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-400">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-600 hover:text-pink-600">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-700">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
} 