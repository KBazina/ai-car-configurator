<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div>
    <nav class="bg-white border-gray-200 dark:bg-gray-900">
      <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
          <span class="self-center text-2xl font-bold whitespace-nowrap dark:text-white"
            >Porsche <span class="text-[#EAA64D]">S</span>lavonija</span
          >
        </a>
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span class="sr-only">Open main menu</span>
          <svg
            class="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div class="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul
            class="font-medium flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0"
          >
            <li>
              <a
                href="/"
                class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                aria-current="page"
                >NASLOVNA</a
              >
            </li>
            <li>
              <a
                href="/about"
                class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >O NAMA</a
              >
            </li>
            <li>
              <a
                href="/cars"
                class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >AUTI</a
              >
            </li>
            <li>
              <a
                href="/configurator"
                class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >KONFIGURATOR</a
              >
            </li>
            <li>
              <a
                href="#"
                class="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >KONTAKT</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <RouterView />
    <footer class="bg-white shadow dark:bg-gray-900">
      <div class="w-full max-w-screen-xl mx-auto p-4 md:py-5">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left"
        >
          <!-- Lijevo: kontakt - RAZDVOJENO -->
          <div
            class="flex flex-col sm:flex-row gap-2 sm:gap-4 text-gray-500 dark:text-gray-400 text-sm"
          >
            <div>📞 Nazovite nas: +385 35 943 243</div>
            <div>📧 info@porscheslavonija.hr</div>
          </div>

          <!-- Sredina: naziv firme -->
          <div class="text-xl font-semibold text-gray-900 dark:text-white">Porsche Slavonija</div>

          <!-- Desno: lokacija i radno vrijeme -->
          <div
            class="flex flex-col sm:flex-row gap-2 sm:gap-4 text-gray-500 dark:text-gray-400 text-sm"
          >
            <div>📍 Vinkovci, Hrvatska</div>
            <div>⏰ Radno vrijeme: Pon-Pet 8:00–16:00</div>
          </div>
        </div>

        <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-4" />

        <span class="block text-sm text-gray-500 text-center dark:text-gray-400">
          © 2024 Porsche Slavonija d.o.o. — Sva prava zadržana
        </span>
      </div>
    </footer>
  </div>
</template>
