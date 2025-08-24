<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import { ref } from 'vue'
import porscheHero from '@/assets/porsche-hero.jpg'
import poslovnica from '@/assets/poslovnica.jpg'
import AI_assist from '@/assets/AI_assist.jpg'
import audi from '@/assets/logos/audi_logo.png'
import vw from '@/assets/logos/vw_logo.png'
import porsche from '@/assets/logos/porsche_logo.png'
import skoda from '@/assets/logos/skoda_logo.png'
import seat from '@/assets/logos/seat_logo.png'
import cupra from '@/assets/logos/cupra_logo.png'
import lambo from '@/assets/logos/lamborghini_logo.jpg'


const idiNaBrend = (logo) => {
  const brend = logoMap[logo]
  if (brend) {
    router.push(`/cars?brand=${encodeURIComponent(brend)}`)
  }
}

const idiNaKonfigurator = () => {
  router.push({
    name: 'configurator', 
    query: { prikaziChat: true }
  })
}


const logos = [audi, vw, porsche, skoda, seat, cupra, lambo]
const logoMap = {
  [audi]: 'Audi',
  [vw]: 'Volkswagen',
  [porsche]: 'Porsche',
  [skoda]: 'Škoda',
  [seat]: 'Seat',
  [cupra]: 'Cupra',
  [lambo]: 'Lamborghini'
}


const openIndex = ref(null)

const toggle = (index) => {
  openIndex.value = openIndex.value === index ? null : index
}

const faqItems = [
  {
    question: 'Nudite li mogućnost zamjene starog vozila za novo?',
    answer:
      'Da, nudimo uslugu procjene i otkupa vašeg starog vozila kao dio zamjene pri kupnji novog automobila. Naši stručnjaci će obaviti brzu procjenu i ponuditi poštenu tržišnu vrijednost koju možete odmah iskoristiti kao umanjenje cijene novog vozila.',
  },
  {
    question: 'Mogu li rezervirati testnu vožnju online?',
    answer:
      'Da, putem našeg kontakt obrasca ili pozivom možete rezervirati testnu vožnju u terminu koji vam odgovara.',
  },
  {
    question: 'Nudite li financiranje vozila?',
    answer:
      'Da, imamo različite opcije financiranja – gotovina, leasing, kredit, kao i savjetovanje pri odabiru najbolje opcije.',
  },
  {
    question: 'Imate li servisne usluge u istoj poslovnici?',
    answer:
      'Da, imamo ovlašteni servis u sklopu poslovnice, s originalnim dijelovima i stručnim timom.',
  },
]
</script>

<template>
  <div class="w-full">
    <div class="relative w-full h-64 sm:h-80 md:h-[500px]">
      <img :src="porscheHero" alt="Porsche vozilo" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/40 z-0"></div>
      <div
        class="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-transparent via-black/40 to-white z-0"
      ></div>
      <h1
        class="absolute top-1/3 left-6 sm:left-10 transform -translate-y-1/2 text-white text-xl sm:text-2xl md:text-4xl font-extrabold max-w-[50%] sm:max-w-md z-10"
      >
        Pravo mjesto za pronaći vaš novi auto
      </h1>
    </div>

    <section class="bg-white py-12">
      <h2 class="text-2xl font-bold text-center mb-6">
        ODABERI SVOJU <span class="text-[#C78A3B]">MARKU</span>
      </h2>

      <div class="max-w-6xl mx-auto">
        <Swiper :loop="true" :slides-per-view="5" :space-between="30" class="mySwiper">
          <SwiperSlide v-for="(logo, index) in logos" :key="index">
            <div class="flex items-center justify-center h-20">
              <img
                :src="logo"
                alt="Logo"
                class="h-full object-contain cursor-pointer"
                @click="idiNaBrend(logo)"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
    <section class="bg-gray-50 py-16 px-6">
      <div class="flex flex-col md:flex-row items-center gap-10 mx-6 sm:mx-10 lg:mx-32">
        <div class="md:w-1/2 w-full">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Zašto odabrati Porsche Slavonija?</h2>
          <p class="text-gray-700 mb-6">
            Naša poslovnica je više od mjesta za kupnju vozila – to je iskustvo, podrška i
            povjerenje koje traje godinama.
          </p>
          <ul class="list-none text-gray-700 space-y-2">
            <li>✔️ Više od 20 godina iskustva u autoindustriji</li>
            <li>✔️ Ovlašteni zastupnik za vodeće brendove: VW, Audi, Škoda, SEAT, Porsche</li>
            <li>✔️ Profesionalna i stručna podrška pri svakom koraku</li>
            <li>✔️ Transparentne cijene i fleksibilne opcije financiranja</li>
            <li>✔️ Dugogodišnje povjerenje kupaca iz cijele regije</li>
          </ul>
        </div>

        <div class="md:w-1/2 w-full">
          <img
            :src="poslovnica"
            alt="Naša poslovnica"
            class="w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded shadow-lg object-cover"
          />
        </div>
      </div>
    </section>
    <section class="relative w-full bg-orange-400">
      <div class="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 items-center relative z-10">
        <div class="text-white relative z-10">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Trebate pomoć pri konfiguraciji vozila?
          </h2>
          <p class="text-lg mb-6">
            Naš virtualni asistent vam stoji na raspolaganju za sva pitanja i savjete pri odabiru
            savršenog automobila za vas.
          </p>
          <button
          @click="idiNaKonfigurator"
            class="bg-[#111827] font-semibold px-6 py-3 rounded shadow hover:bg-[#212f4d] transition-all"
          >
            💬 Razgovaraj s asistentom
          </button>
        </div>
      </div>

      <div class="absolute inset-0 z-0">
        <img :src="AI_assist" alt="Virtualni asistent" class="w-full h-full object-cover" />
        <div
          class="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-400/70 to-transparent"
        ></div>
      </div>
    </section>
    <section class="bg-white py-16 px-6 sm:px-10 lg:px-32">
      <h2 class="text-4xl font-bold text-gray-900 text-center mb-10">
        ČESTO POSTAVLJENA <span class="text-orange-400">PITANJA</span>
      </h2>
      <div class="space-y-4 max-w-4xl mx-auto">
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            class="w-full flex justify-between items-center px-6 py-4 text-left text-gray-800 font-medium hover:bg-gray-50 transition"
            @click="toggle(index)"
          >
            {{ item.question }}
            <span class="text-xl">{{ openIndex === index ? '^' : '?' }}</span>
          </button>
          <div v-if="openIndex === index" class="px-6 pb-4 text-gray-600 bg-gray-50">
            {{ item.answer }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
