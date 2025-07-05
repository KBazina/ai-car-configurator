<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const auti = ref([])
const brojKolona = ref(1)

const router = useRouter()

onMounted(async () => {
  const res = await axios.get('http://localhost:5000/api/auti')
  auti.value = res.data
  updateBrojKolona()
  window.addEventListener('resize', updateBrojKolona)
})

const updateBrojKolona = () => {
  const širina = window.innerWidth
  if (širina >= 1280) brojKolona.value = 4
  else if (širina >= 1024) brojKolona.value = 3
  else if (širina >= 640) brojKolona.value = 2
  else brojKolona.value = 1
}

// Grupiranje auta po redovima
const grupiraniRedovi = computed(() => {
  const rezultat = []
  for (let i = 0; i < auti.value.length; i += brojKolona.value) {
    rezultat.push(auti.value.slice(i, i + brojKolona.value))
  }
  return rezultat
})

const idiNaDetalje = (id) => {
  router.push(`/car/${id}`)
}
</script>

<template>
  <div class="bg-white">
    <div class="py-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-10 text-center">Rabljena vozila</h2>

      <div
        v-for="(red, index) in grupiraniRedovi"
        :key="index"
        :class="index % 2 === 1 ? 'bg-[#111827] w-full' : 'bg-white w-full'"
      >
        <div
          class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"
        >
          <div
            class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 py-6 px-2"
          >
            <div
              v-for="auto in red"
              :key="auto._id"
              @click="idiNaDetalje(auto._id)"
              class="group block border border-gray-200 p-4 rounded-lg hover:shadow-lg transition cursor-pointer bg-white"
            >
              <img
                :src="auto.slika"
                :alt="`${auto.marka} ${auto.model}`"
                class="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8"
              />
              <h3 class="mt-4 text-md font-semibold text-gray-800">{{ auto.marka }} {{ auto.model }}</h3>
              <p class="text-sm text-gray-600">Godina: {{ auto.godina }} | {{ auto.gorivo }}</p>
              <p class="text-sm text-gray-600">
                Kilometraža: {{ Number(auto.kilometraza).toLocaleString('de-DE') }} km
              </p>
              <p class="mt-1 text-lg font-medium text-gray-900">
                {{ Number(auto.cijena).toLocaleString('de-DE') }} €
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

