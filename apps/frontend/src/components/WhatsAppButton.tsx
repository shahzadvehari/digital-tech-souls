"use client";

import React from 'react';

interface WhatsAppButtonProps {
  message?: string;
  label?: string;
  className?: string;
  phoneNumber?: string;
}

export default function WhatsAppButton({ 
  message = "Hello, I'm interested in your services.", 
  label = "Chat on WhatsApp", 
  className = "",
  phoneNumber = "923004742747" // Default WhatsApp Number
}: WhatsAppButtonProps) {
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:-translate-y-1 text-center cursor-pointer ${className}`}
    >
      {label}
    </a>
  );
}
