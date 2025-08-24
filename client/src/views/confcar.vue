<template>
  <div class="min-h-screen bg-white py-12 px-6">
    <!-- Naslov -->
    <div class="max-w-3xl mx-auto text-center">
      <img
        :src="`/configurator/${podmodel.slika}`"
        alt="Odabrani model"
        class="w-full max-w-md mx-auto mb-6 object-contain"
      />
      <h2 class="text-3xl font-bold mb-2">{{ podmodel.naziv }}</h2>
      <p class="text-xl text-gray-700">
        Početna cijena:
        <span class="text-[#C78A3B] font-semibold">
          {{Number(ukupnaCijena).toLocaleString('de-DE') }} €
        </span>
      </p>
    </div>

    <!-- KORAK 1 - Motorizacija -->
    <div v-if="korak === 1" class="max-w-5xl mx-auto mt-10">
      <h3 class="text-lg font-semibold mb-4">Odaberi motorizaciju:</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <label
          v-for="(motor, index) in podmodel.motorizacije"
          :key="index"
          class="border rounded-lg p-4 cursor-pointer hover:shadow transition flex flex-col justify-between relative h-full"
        >
          <div class="flex items-start gap-4">
            <input
              type="radio"
              :value="motor"
              v-model="odabranaMotorizacija"
              name="motorizacija"
              class="mt-1 accent-[#C78A3B]"
            />
            <div>
              <p class="font-semibold">{{ motor.naziv }}</p>
              <p class="text-gray-600 flex items-center">
                <img :src="snagapng" alt="snaga" class="w-7 h-5 mr-2" />
                Snaga: {{ motor.snaga_kW }} kW
              </p>
              <p class="text-gray-600 flex items-center">
                <img :src="motoricpng" alt="gorivo" class="w-7 h-5 mr-2" />
                Tip goriva: {{ motor.tip }}
              </p>
              <p class="text-gray-600 flex items-center">
                <img :src="pogonpng" alt="pogon" class="w-7 h-5 mr-2" />
                Pogon: {{ motor.pogon }}
              </p>
              <p v-if="motor.performance" class="text-[#C78A3B] font-medium">Performance verzija</p>
            </div>
          </div>
          <p
            v-if="motor.nadoplata && motor.nadoplata > 0"
            class="text-sm text-gray-500 absolute bottom-2 right-3"
          >
            Nadoplata:
            <span class="text-[#C78A3B] font-semibold">
              {{ Number(motor.nadoplata).toLocaleString('de-DE') }}
            </span>
            €
          </p>
        </label>
      </div>

      <div v-if="odabranaMotorizacija" class="text-center mt-6">
        <button
          @click="korak = 2"
          class="bg-[#C78A3B] text-white px-6 py-2 rounded shadow hover:bg-[#a6702d] transition"
        >
          Dalje
        </button>
      </div>
    </div>

    <!-- KORAK 2 - Oprema -->
    <div v-if="korak === 2" class="max-w-4xl mx-auto mt-10">
      <h3 class="text-xl font-bold mb-4 text-center">Odaberi dodatnu opremu</h3>
      <div class="grid sm:grid-cols-2 gap-4">
        <label
          v-for="(op, index) in podmodel.oprema"
          :key="index"
          class="flex items-center border rounded p-4 hover:shadow transition"
        >
          <input
            type="checkbox"
            :value="op"
            v-model="odabranaOprema"
            class="accent-[#C78A3B] mr-3"
            @change="updateCijena"
          />
          <div>
            <p class="font-medium">{{ op.naziv }}</p>
            <p class="text-sm text-gray-500">{{ Number(op.cijena).toLocaleString('de-DE') }} €</p>
          </div>
        </label>
      </div>

      <div class="flex justify-between mt-6">
        <button
          @click="korak = 1"
          class="px-5 py-2 border border-[#C78A3B] text-[#C78A3B] rounded hover:bg-[#f5eee5] transition"
        >
          Natrag
        </button>
        <button
          @click="korak = 3"
          class="bg-[#C78A3B] text-white px-6 py-2 rounded shadow hover:bg-[#a6702d] transition"
        >
          Dalje
        </button>
      </div>
    </div>

    <!-- KORAK 3 - Pregled -->
    <div v-if="korak === 3" class="max-w-3xl mx-auto mt-10">
      <h3 class="text-2xl font-bold mb-4 text-center">Tvoja konfiguracija</h3>

      <div class="bg-gray-100 p-6 rounded-lg">
        <h4 class="text-lg font-semibold mb-2">Model: {{ podmodel.naziv }}</h4>
        <p class="mb-2">Motorizacija: {{ odabranaMotorizacija.naziv }}</p>
        <p>
          Snaga: {{ odabranaMotorizacija.snaga_kW }} kW | Tip goriva:
          {{ odabranaMotorizacija.tip }} | Pogon: {{ odabranaMotorizacija.pogon }}
        </p>

        <div class="mt-6">
          <h5 class="font-semibold">Dodatna oprema:</h5>
          <ul class="list-disc ml-6">
            <li v-for="(op, idx) in odabranaOprema" :key="idx">
              {{ op.naziv }} – {{ Number(op.cijena).toLocaleString('de-DE') }} €
            </li>
          </ul>
        </div>

        <p class="mt-6 text-xl font-bold">
          Ukupna cijena:
          <span class="text-[#C78A3B]"> {{ Number(ukupnaCijena).toLocaleString('de-DE') }} € </span>
        </p>
      </div>
      <div class="mt-10 text-center">
        <h4 class="text-lg font-semibold mb-2">Pošalji konfiguraciju na svoj e-mail</h4>
        <input
          type="email"
          v-model="email"
          placeholder="Unesi svoj e-mail"
          class="border rounded px-4 py-2 w-full max-w-md mb-3"
        />
        <button
          @click="posaljiMail"
          :disabled="saljeSe"
          class="bg-[#C78A3B] text-white px-6 py-2 rounded shadow hover:bg-[#a6702d] transition"
        >
          {{ saljeSe ? 'Šalje se...' : 'Pošalji konfiguraciju' }}
        </button>
        <p v-if="porukaPoslana" class="text-green-600 mt-2">Konfiguracija je poslana!</p>
        <p v-if="greska" class="text-red-600 mt-2">Došlo je do greške. Pokušaj ponovno.</p>
        <button
  v-if="jePrijavljen"
  @click="spremiKonfiguraciju"
  class="bg-green-600 text-white px-6 py-2 mt-4 rounded shadow hover:bg-green-700 transition"
>
  Spremi konfiguraciju
</button>
<p v-if="porukaSpremanja" class="text-green-600 mt-2">Konfiguracija spremljena!</p>
      </div>

      <div class="text-center mt-6">
        <button
          @click="korak = 2"
          class="px-5 py-2 border border-[#C78A3B] text-[#C78A3B] rounded hover:bg-[#f5eee5] transition"
        >
          Natrag na opremu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'

import snagapng from '@/assets/logos/snaga.png'
import motoricpng from '@/assets/logos/motoric.png'
import pogonpng from '@/assets/logos/pogon.png'

const porukaSpremanja = ref(false)
const user = ref(null)
const jePrijavljen = ref(false)

const route = useRoute()

console.log('🔍 Podaci primljeni kroz router.query:', route.query.data)
const podmodel = JSON.parse(route.query.data)
console.log("parsirani model: ", podmodel)





import axios from 'axios'

const email = ref('')
const saljeSe = ref(false)
const porukaPoslana = ref(false)
const greska = ref(false)

const posaljiMail = async () => {
  if (!email.value) return

  saljeSe.value = true
  porukaPoslana.value = false
  greska.value = false

  const podaci = {
    email: email.value,
    model: podmodel.naziv,
    motorizacija: odabranaMotorizacija.value,
    oprema: odabranaOprema.value,
    cijena: ukupnaCijena.value,
  }

  try {
    await axios.post('http://localhost:5000/api/posalji-konfiguraciju', podaci)
    porukaPoslana.value = true
    email.value = ''
  } catch (err) {
    greska.value = true
  } finally {
    saljeSe.value = false
  }
}


let odabranaMotorizacija = ref('')
const odabranaOprema = ref([])
let korak = ref(1)
const osnovnaCijena = ref(podmodel.cijena)

if (podmodel.preporucena_motorizacija) {
  odabranaMotorizacija.value = podmodel.motorizacije.find(
    m => m._id === podmodel.preporucena_motorizacija._id
  )

  odabranaOprema.value = podmodel.oprema.filter(op =>
    podmodel.preporucena_oprema?.some(sel => sel._id === op._id)
  )

  korak.value = 3
}

const ukupnaCijena = computed(() => {
  const dodatakOpreme = odabranaOprema.value.reduce((sum, op) => sum + op.cijena, 0)
  const nadoplataMotora =
    odabranaMotorizacija.value?.nadoplata > 0 ? odabranaMotorizacija.value.nadoplata : 0
  return osnovnaCijena.value + dodatakOpreme + nadoplataMotora
})
onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) {
    user.value = JSON.parse(stored)
    jePrijavljen.value = true
  }
})

const spremiKonfiguraciju = async () => {
  if (!user.value) return
  porukaSpremanja.value = false
console.log(podmodel)
const podaci = {
  userId: user.value.id,
  konfiguracija: {
    podmodelNaziv: podmodel.naziv,
    motorizacija: odabranaMotorizacija.value,
    oprema: odabranaOprema.value,
    cijena: ukupnaCijena.value
  }
}


  try {
    await axios.post('http://localhost:5000/api/konfiguracije/spremi', podaci)
    porukaSpremanja.value = true
  } catch (err) {
    console.error('Greška pri spremanju konfiguracije', err)
  }
}


const updateCijena = () => {
}
</script>
