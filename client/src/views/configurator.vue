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

      <div class="fixed bottom-4 right-4 z-50">
      <button
        @click="prikaziChat = !prikaziChat"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg"
      >
        🤖 Pomoć AI
      </button>

      <div
        v-if="prikaziChat"
        class="w-[320px] max-h-[500px] bg-white border border-gray-300 shadow-xl rounded-lg mt-2 flex flex-col"
      >
        <div class="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-semibold">AI Konfigurator</div>
        <div class="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
          <div v-for="(msg, i) in poruke" :key="i">
            <div v-if="msg.rola === 'korisnik'" class="text-right">
              <div class="inline-block bg-blue-100 text-gray-800 px-3 py-2 rounded-xl">{{ msg.tekst }}</div>
            </div>
            <div v-else class="text-left">
              <div class="inline-block bg-gray-200 text-gray-800 px-3 py-2 rounded-xl">{{ msg.tekst }}</div>
            </div>
          </div>
        </div>
        <form @submit.prevent="posaljiUpit" class="p-2 border-t flex gap-2">
          <input
            v-model="trenutniUpit"
            type="text"
            placeholder="Pitaj nešto o autima..."
            class="flex-1 border rounded px-3 py-1 text-sm focus:outline-none"
          />
          <button type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">Pošalji</button>
        </form>
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

const prikaziChat = ref(false)
const trenutniUpit = ref('')
const poruke = ref([])

const posaljiUpit = async () => {
  if (!trenutniUpit.value.trim()) return

  const korisnickaPoruka = { rola: 'korisnik', tekst: trenutniUpit.value }
  poruke.value.push(korisnickaPoruka)

  try {
    const odgovor = await axios.post('http://localhost:5000/api/ai-konfiguracija', {
      zahtjev: trenutniUpit.value
    })

    const konfiguracija = odgovor.data.konfiguracija
    console.log(konfiguracija)
    // Formatiraj AI odgovor u prikazivu poruku
    const prikaz = `
${konfiguracija}
    `.trim()

    poruke.value.push({ rola: 'ai', tekst: prikaz })
    router.push({
  name: "confcar", 
  query: {
    data: JSON.stringify(konfiguracija)
  }
});
  } catch (err) {
    console.error(err)
    poruke.value.push({ rola: 'ai', tekst: '⚠️ Došlo je do greške pri generiranju konfiguracije.' })
  } finally {
    trenutniUpit.value = ''
  }
}

</script>

<style scoped>
img {
  pointer-events: none;
}
</style>
