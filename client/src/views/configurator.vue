<template>
  <div class="bg-white py-8">
    <h2 class="text-3xl font-bold text-center mb-10">
      <span class="text-[#C78A3B]">Odaberi</span> model za konfiguraciju
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
      <div
        v-for="model in modeli"
        :key="model.naziv"
        class="rounded-lg cursor-pointer p-6 flex flex-col items-center justify-between shadow-md hover:shadow-lg transition"
        :style="{ backgroundColor: model.pozadina }"
        @click="odaberiModel(model)"
      >
        <img :src="`/configurator/${model.slika}`" :alt="model.naziv" class="h-40 object-contain mb-4" />
        <h3 class="text-2xl font-semibold text-black">{{ model.naziv }}</h3>
        <p class="text-gray-800 text-sm mt-1">Klikni za više modela</p>
      </div>
    </div>

    <div v-if="odabraniModel" ref="podmodeli" class="mt-12 max-w-7xl mx-auto px-4">
      <h3 class="text-2xl font-bold text-center mb-6">{{ odabraniModel.naziv }} modeli</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="podmodel in odabraniModel.podmodeli"
          :key="podmodel.naziv"
          class="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition cursor-pointer"
          @click="idiNaConfCar(podmodel)"
        >
          <img :src="`/configurator/${podmodel.slika}`" class="w-full h-40 object-contain mb-2" />
          <h4 class="text-lg font-semibold">{{ podmodel.naziv }}</h4>
          <p class="text-gray-600 mt-1">od {{ podmodel.cijena.toLocaleString('de-DE') }} €</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const modeli = ref([])
const odabraniModel = ref(null)
const podmodeli = ref(null)

const odaberiModel = async (model) => {
  odabraniModel.value = model
  await nextTick()
  podmodeli.value?.scrollIntoView({ behavior: 'smooth' })
}

const idiNaConfCar = (model) => {
  router.push({
    name: 'confcar',
    query: {
      data: JSON.stringify(model)
    }
  })
}

// Dohvati sve modele iz backend API-ja
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/modeli') // prilagodi ako endpoint nije ovajs
    modeli.value = response.data
  } catch (error) {
    console.error('Greška prilikom dohvaćanja modela:', error)
  }
})
</script>

<style scoped>
img {
  pointer-events: none;
}
</style>
