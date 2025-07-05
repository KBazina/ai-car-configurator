<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const auti = ref([])

onMounted(async () => {
  const res = await axios.get('http://localhost:5000/api/auti')
  auti.value = res.data
})
</script>

<template>
  <div class="bg-white">
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-10 text-center">Rabljena vozila</h2>

      <div
        class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
      >
        <a
          v-for="auto in auti"
          :key="auto._id"
          href="#"
          class="group block border border-gray-200 p-4 rounded-lg hover:shadow-lg transition"
        >
          <img
            :src="auto.slika"
            :alt="`${auto.marka} ${auto.model}`"
            class="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8"
          />
          <h3 class="mt-4 text-md font-semibold text-gray-800">{{ auto.marka }} {{ auto.model }}</h3>
          <p class="text-sm text-gray-600">Godina: {{ auto.godina }} | {{ auto.gorivo }}</p>
          <p class="text-sm text-gray-600">Kilometraža: {{ Number(auto.kilometraza).toLocaleString('de-DE') }}
 km</p>
          <p class="mt-1 text-lg font-medium text-gray-900">{{ auto.cijena }} €</p>
        </a>
      </div>
    </div>
  </div>
</template>
