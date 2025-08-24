<template>
  <div class="bg-white">
    <div class="w-full bg-gray-100 shadow-sm py-6 px-4 sm:px-8">
      <form
        @submit.prevent="filtriraj"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 max-w-7xl mx-auto"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700">Godina od</label>
          <input v-model="filteri.godinaOd" type="number" min="1990" max="2025" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Godina do</label>
          <input v-model="filteri.godinaDo" type="number" min="1990" max="2025" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Snaga (kW)</label>
          <input v-model="filteri.snaga" type="number" min="30" max="1000" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Gorivo</label>
          <select v-model="filteri.gorivo" class="input">
            <option value="">Svi</option>
            <option value="benzin">Benzin</option>
            <option value="diesel">Diesel</option>
            <option value="hibrid">Hibrid</option>
            <option value="elektricni">Električni</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Marka</label>
          <select v-model="filteri.marka" class="input">
            <option value="">Svi</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Audi">Audi</option>
            <option value="Škoda">Škoda</option>
            <option value="Seat">Seat</option>
            <option value="Porsche">Porsche</option>
            <option value="Lamborghini">Lamborghini</option>
            <option value="Cupra">Cupra</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Model</label>
          <input v-model="filteri.model" type="text" class="input" placeholder="npr. A4" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Mjenjač</label>
          <select v-model="filteri.mjenjac" class="input">
            <option value="">Svi</option>
            <option value="ručni">Ručni</option>
            <option value="automatski">Automatski</option>
          </select>
        </div>
        <div class="xl:col-span-6 text-right mt-4">
          <button type="submit" class="btn-blue">Pretraži</button>
        </div>
      </form>
    </div>

    <div v-if="favoriti.length > 0" class="max-w-7xl mx-auto px-4 mt-10">
  <h2 class="text-2xl font-bold text-orange-600 mb-6">Favoriti</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    <div
      v-for="auto in favoriti"
      :key="auto._id"
      @click="idiNaDetalje(auto._id)"
      class="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
    >
      <img :src="auto.slika" class="w-full h-48 object-cover rounded mb-3" />
      <h3 class="text-lg font-semibold text-gray-800">{{ auto.marka }} {{ auto.model }}</h3>
      <p class="text-sm text-gray-600">{{ auto.godina }} | {{ auto.gorivo }}</p>
      <p class="text-sm text-gray-600">
        {{ Number(auto.kilometraza).toLocaleString('de-DE') }} km
      </p>
      <p class="text-lg font-bold text-orange-700 mt-2">
        {{ Number(auto.cijena).toLocaleString('de-DE') }} €
      </p>
    </div>
  </div>
</div>
<div v-if="favoriti.length > 0" class="max-w-7xl mx-auto my-12 flex items-center text-gray-400">
  <div class="flex-grow border-t border-gray-300"></div>
  <span class="mx-4 text-sm font-medium text-gray-500">Sva rabljena vozila</span>
  <div class="flex-grow border-t border-gray-300"></div>
</div>

    <div ref="rabljenaVozila">
      <h2 v-if="favoriti.length == 0" class="text-3xl font-bold text-gray-900 mb-10 text-center mt-6">Rabljena vozila</h2>
      <div v-if="filtriraniAuti.length === 0" class="text-center text-gray-600 py-12 text-lg">
        Nema vozila koja odgovaraju odabranim filterima.
      </div>
      <div
        v-for="(red, index) in grupiraniRedovi"
        :key="index"
        :class="index % 2 === 1 ? 'bg-[#111827] w-full' : 'bg-white w-full'"
      >
        <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
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
              <h3 class="mt-4 text-md font-semibold text-gray-800">
                {{ auto.marka }} {{ auto.model }}
              </h3>
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
    <div v-if="superPrilike.length > 0" class="super-gradient py-12">
      <h2 class="text-2xl font-bold text-center text-orange-700 mb-8">
        🔥 Super prilike za Porsche vozila 🔥
      </h2>
      <div
        class="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      >
        <div
          v-for="(auto, idx) in superPrilike"
          :key="idx"
          class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
          @click="idiNaDetalje(auto._id)"
        >
          <img
            :src="auto.slika"
            :alt="auto.marka"
            class="w-full h-48 object-cover rounded-md mb-3"
          />
          <h3 class="text-lg font-semibold text-gray-800">{{ auto.marka }} {{ auto.model }}</h3>
          <p class="text-sm text-gray-600">{{ auto.godina }} | {{ auto.gorivo }}</p>
          <p class="text-sm text-gray-600">
            {{ Number(auto.kilometraza).toLocaleString('de-DE') }} km
          </p>
          <p class="text-lg font-bold text-orange-700 mt-2">
            {{ Number(auto.cijena).toLocaleString('de-DE') }} €
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()

const auti = ref([])
const filtriraniAuti = ref([])
const superPrilike = ref([])
const favoriti = ref([])
const brojKolona = ref(1)
const rabljenaVozila = ref(null)

const filteri = ref({
  godinaOd: '',
  godinaDo: '',
  snaga: '',
  gorivo: '',
  marka: '',
  model: '',
  mjenjac: '',
})

onMounted(async () => {
  const res = await axios.get('http://localhost:5000/api/auti')
  auti.value = res.data
  filtriraniAuti.value = res.data
  superPrilike.value = res.data
    .filter((auto) => auto.marka.toLowerCase() === 'porsche')
    .slice(0, 4)

  updateBrojKolona()
  window.addEventListener('resize', updateBrojKolona)

  if (route.query.brand) {
    filteri.value.marka = route.query.brand
    filtriraj()
  }

  // Dohvaćanje favorita
  const storedUser = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  if (storedUser && token) {
    try {
      const user = JSON.parse(storedUser)
      const favRes = await axios.post(
        'http://localhost:5000/api/favoriti/svi',
        { email: user.email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      favoriti.value = favRes.data
    } catch (err) {
      console.error('Greška pri dohvaćanju favorita:', err)
    }
  }
})

const updateBrojKolona = () => {
  const širina = window.innerWidth
  if (širina >= 1280) brojKolona.value = 4
  else if (širina >= 1024) brojKolona.value = 3
  else if (širina >= 640) brojKolona.value = 2
  else brojKolona.value = 1
}

const grupiraniRedovi = computed(() => {
  const rezultat = []
  for (let i = 0; i < filtriraniAuti.value.length; i += brojKolona.value) {
    rezultat.push(filtriraniAuti.value.slice(i, i + brojKolona.value))
  }
  return rezultat
})

const idiNaDetalje = (id) => {
  router.push(`/car/${id}`)
}

const filtriraj = () => {
  filtriraniAuti.value = auti.value.filter((auto) => {
    return (
      (!filteri.value.godinaOd || auto.godina >= filteri.value.godinaOd) &&
      (!filteri.value.godinaDo || auto.godina <= filteri.value.godinaDo) &&
      (!filteri.value.snaga || auto.snaga >= filteri.value.snaga) &&
      (!filteri.value.gorivo || auto.gorivo === filteri.value.gorivo) &&
      (!filteri.value.marka ||
        auto.marka.toLowerCase().includes(filteri.value.marka.toLowerCase())) &&
      (!filteri.value.model ||
        auto.model.toLowerCase().includes(filteri.value.model.toLowerCase())) &&
      (!filteri.value.mjenjac || auto.mjenjac === filteri.value.mjenjac)
    )
  })

  if (rabljenaVozila.value) {
    rabljenaVozila.value.scrollIntoView({ behavior: 'smooth' })
  }
}

</script>

<style scoped>

.super-gradient {
  background: linear-gradient(to right, #ea944e 0%, #ffffff 80%);
}

.input {
  @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}
.btn-blue {
  @apply inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition;
}
</style>
