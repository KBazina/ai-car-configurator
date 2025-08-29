<template>
  <div class="w-full">
    <!-- Hero sekcija -->
    <section class="relative w-full h-64 sm:h-80 md:h-[400px]">
      <img :src="heroImage" alt="O nama" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-white"></div>
      <div class="absolute inset-0 flex items-center justify-center">
        <h1 class="text-white text-4xl md:text-5xl font-bold z-10">O NAMA</h1>
      </div>
    </section>

    <!-- Naša priča -->
    <section class="py-16 px-6">
      <div class="flex flex-col md:flex-row items-center gap-10 mx-6 sm:mx-10 lg:mx-32">
        <div class="md:w-1/2 w-full">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">
            Naša <span class="text-[#C78A3B]">priča</span>
          </h2>
          <p class="text-gray-700 leading-relaxed">
              Porsche Slavonija je ovlašteni zastupnik renomiranih marki poput Porschea, Audija,
            Volkswagena, Škode i SEAT-a. Već više od 20 godina pružamo vrhunsku uslugu,
            profesionalan pristup i iskustvo kupovine koje se pamti. Naša misija je spojiti vrhunsku
            tehnologiju i individualni pristup kako bismo svakom kupcu omogućili savršen automobil
            za njegove potrebe.
          </p>
        </div>
        <div class="md:w-1/2 w-full">
          <img :src="poslovnica" alt="Naša poslovnica" class="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover border-4 border-black" />
        </div>
      </div>
    </section>

    <!-- Vrijednosti -->
    <section class="py-16 bg-gray-50 px-6 sm:px-12 lg:px-32">
      <h2 class="text-3xl font-bold text-gray-900 mb-10 text-center">Naše vrijednosti</h2>
      <div class="grid gap-8 md:grid-cols-3 text-center">
        <div><span class="text-orange-400 text-5xl">🚗</span><h3 class="text-xl font-semibold mt-4">Stručnost</h3><p class="text-gray-600 mt-2">Više od dva desetljeća iskustva u autoindustriji.</p></div>
        <div><span class="text-orange-400 text-5xl">🤝</span><h3 class="text-xl font-semibold mt-4">Povjerenje</h3><p class="text-gray-600 mt-2">Tisuće zadovoljnih kupaca iz cijele regije.</p></div>
        <div><span class="text-orange-400 text-5xl">⚙️</span><h3 class="text-xl font-semibold mt-4">Kvaliteta</h3><p class="text-gray-600 mt-2">Samo originalni dijelovi i ovlašteni servisi.</p></div>
      </div>
    </section>

    <!-- Galerija -->
    <section class="my-3 px-4 py-6 sm:px-6 md:px-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- slike -->
        <div v-for="(group, index) in slikeGrupirane" :key="index" class="grid gap-4">
          <div v-for="slika in group" :key="slika" >
            <img class="h-auto max-w-full rounded-lg" :src="slika" alt="" />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Kontakt -->
    <section class="bg-gray-100 py-16 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Želite saznati više?</h2>
      <p class="text-gray-700 mb-6">Kontaktirajte nas i saznajte kako vam možemo pomoći pri kupnji vozila.</p>
      <button @click="posaljiUpit" class="bg-orange-400 text-white font-semibold px-6 py-3 rounded hover:bg-orange-500">
        Kontaktiraj nas
      </button>
    </section>

    <!-- Pop-up forma za kontakt -->
    <div v-if="pokaziFormu" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="relative bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
        <button class="absolute top-4 right-4 text-gray-500 hover:text-black" @click="pokaziFormu = false">✖</button>
        <h2 class="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">Pošalji mail</h2>
        <form @submit.prevent="posaljiMail">
          <textarea v-model="poruka" placeholder="Vaša poruka..." class="w-full p-3 border rounded mb-4 dark:bg-gray-700 dark:text-white"></textarea>
          <button type="submit" class="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded w-full">Pošalji</button>
        </form>
        <p v-if="status" class="mt-2 text-center text-green-600">{{ status }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import heroImage from '@/assets/about_hero.jpg'
import poslovnica from '@/assets/tim_desno.jpg'
import slika1 from '@/assets/slike/slika1.png'
import slika2 from '@/assets/slike/slika2.jpg'
import slika3 from '@/assets/slike/slika3.jpg'
import slika4 from '@/assets/slike/slika4.jpg'
import slika5 from '@/assets/slike/slika5.jpg'
import slika6 from '@/assets/slike/slika6.jpg'
import slika7 from '@/assets/slike/slika7.png'
import slika8 from '@/assets/slike/slika8.png'
import slika9 from '@/assets/slike/slika9.jpg'
import slika10 from '@/assets/slike/slika10.jpg'
import slika11 from '@/assets/slike/slika11.jpg'
import slika12 from '@/assets/slike/slika12.jpg'

const slike = [slika1, slika2, slika3, slika4, slika5, slika6, slika7, slika8, slika9, slika10, slika11, slika12]
const slikeGrupirane = computed(() => {
  const rezultat = []
  for (let i = 0; i < slike.length; i += 3) {
    rezultat.push(slike.slice(i, i + 3))
  }
  return rezultat
})

const pokaziFormu = ref(false)
const poruka = ref('')
const status = ref('')

const posaljiUpit = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    window.alert('Prvo se morate prijaviti kako biste nas kontaktirali.')
    return
  }
  pokaziFormu.value = true
}

const posaljiMail = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/send-mail`, {
      poruka: poruka.value
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    status.value = 'Poruka je uspješno poslana!'
    poruka.value = ''
  } catch (err) {
    status.value = 'Greška pri slanju poruke.'
  }
}
</script>
