<template>
  <div class="min-h-screen bg-neutral-50">
    <header class="bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-neutral-900">
            Foodics Reservations
          </h1>
          <button
            type="button"
            class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            @click="toggleLocale"
          >
            {{ locale === 'en' ? 'العربية' : 'English' }}
          </button>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <p class="text-neutral-600">Welcome to Foodics Reservations System</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const toggleLocale = () => {
  locale.value = locale.value === 'en' ? 'ar' : 'en';
};
</script>
