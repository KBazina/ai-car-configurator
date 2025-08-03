<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const auto = ref(null)

const token = localStorage.getItem('token')
const user = ref(null)
const jeFavorit = ref(false)

const loadUser = async () => {
  try {
    const stored = localStorage.getItem('user')
    user.value = stored ? JSON.parse(stored) : null
  } catch (e) {
    user.value = null
  }
}


const isLoggedIn = computed(() => !!user.value?.email)

const prikaziReklamu = ref(true)
const rezervirajTermin = () => {
  alert('Zahtjev za probnu vožnju poslan.')
  prikaziReklamu.value = false
}

const toggleFavorit = async () => {
  if (!user.value || !auto.value) return

  try {
    await axios.post(
      'http://localhost:5000/api/favoriti/toggle',
      {
        email: user.value.email,
        autoId: auto.value._id
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    jeFavorit.value = !jeFavorit.value // 🔁 lokalno okreni stanje
  } catch (err) {
    console.error('Greška pri dodavanju/uklanjanju iz favorita:', err)
  }
}


onMounted(async () => {
  try {
    await loadUser()
    window.addEventListener('storage', loadUser)

    const res = await axios.get(`http://localhost:5000/api/auti/${route.params.id}`)
    auto.value = res.data

    if (user.value) {
      const favRes = await axios.post(
        'http://localhost:5000/api/favoriti/check',
        {
          email: user.value.email,
          autoId: route.params.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      jeFavorit.value = favRes.data.jeFavorit
    }
  } catch (err) {
    console.error('Greška pri dohvaćanju auta ili provjeri favorita:', err)
  }
})

</script>

<template>
  <div v-if="auto">
    <div class="max-w-6xl mx-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <img
          :src="auto.slika"
          :alt="auto.model"
          class="w-full h-[400px] object-cover rounded-lg shadow-md"
        />

        <div>
          <h1 class="text-3xl font-bold mb-4">
            {{ auto.marka }} {{ auto.model }}
            <button
              v-if="isLoggedIn"
              @click="toggleFavorit"
              class="ml-2 text-2xl text-yellow-500"
              title="Dodaj/ukloni iz favorita"
            >
              <span v-if="jeFavorit">&#9733;</span>
              <span v-else>&#9734;</span>
            </button>
          </h1>
          <p class="text-gray-700 text-lg mb-2">Godina: {{ auto.godina }}</p>
          <p class="text-gray-700 text-lg mb-2">
            Kilometraža: {{ Number(auto.kilometraza).toLocaleString() }} km
          </p>
          <p class="text-gray-700 text-lg mb-2">Gorivo: {{ auto.gorivo }}</p>
          <p class="text-gray-700 text-lg mb-2">Mjenjač: {{ auto.mjenjac }}</p>
          <p class="text-gray-700 text-lg mb-2">Snaga: {{ auto.snaga }} kW</p>
          <p class="text-gray-700 text-lg mb-2 font-bold">Garancija: 2 godine</p>
          <hr class="border-t-1 border-gray-800 my-6" />
          <p class="text-2xl font-semibold text-[#C78A3B] mt-4 text-right mr-8">
            {{ Number(auto.cijena).toLocaleString() }} €
          </p>
        </div>
      </div>
    </div>

    <!-- Reklama -->
    <div v-if="prikaziReklamu" class="hidden lg:block fixed top-40 left-0 w-500 z-10">
      <div class="bg-orange-100 p-6 rounded-r-lg shadow-md text-center relative">
        <button
          @click="prikaziReklamu = false"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg font-bold"
        >
          ×
        </button>
        <h3 class="text-xl font-bold text-[#C78A3B] mb-2 mt-4">Želiš probnu vožnju?</h3>
        <p class="text-gray-800 mb-4">Rezerviraj termin i isprobaj vozilo bez obveze!</p>
        <button
          @click="rezervirajTermin"
          class="bg-[#C78A3B] text-white px-4 py-2 rounded hover:bg-[#a76c2f] transition"
        >
          REZERVIRAJ TERMIN
        </button>
      </div>
    </div>

    <div class="block lg:hidden my-10">
      <div class="bg-orange-100 p-6 rounded-lg shadow-md text-center">
        <h3 class="text-xl font-bold text-[#C78A3B] mb-2">Želiš probnu vožnju?</h3>
        <p class="text-gray-800 mb-4">Rezerviraj termin i isprobaj vozilo bez obveze!</p>
        <button class="bg-[#C78A3B] text-white px-4 py-2 rounded hover:bg-[#a76c2f] transition">
          REZERVIRAJ TERMIN
        </button>
      </div>
    </div>

    <section class="max-w-6xl mx-auto px-6 mb-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div class="order-1 lg:order-2">
          <h2 class="text-2xl font-bold mb-4"><span class="text-[#C78A3B]">Oprema</span> vozila</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li v-for="(stavka, index) in auto.oprema" :key="index">{{ stavka }}</li>
          </ul>
        </div>

        <div class="order-3">
          <div class="flex items-center space-x-6 mb-6">
            <img src="/prodavac.jpg" alt="Prodavač" class="w-24 h-24 rounded-full object-cover shadow-md" />
            <div>
              <p class="text-lg font-semibold">Ivan Horvat</p>
              <p class="text-gray-700">Prodajni savjetnik</p>
              <p class="text-gray-700">📞 +385 91 123 4567</p>
              <p class="text-gray-700">📧 ivan@autokuca.hr</p>
            </div>
          </div>

         <iframe
            class="w-full h-64 rounded-md shadow"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13392.086909505966!2d18.80296318507902!3d45.30197205176515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475c8b16db862ec5%3A0xa7ede5b5e1661f07!2sUl.%20Brune%20Bu%C5%A1i%C4%87a%2020%2C%2032100%2C%20Vinkovci!5e0!3m2!1shr!2shr!4v1751717631752!5m2!1shr!2shr"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  </div>
</template>
