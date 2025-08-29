<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const kontaktRef = ref(null)
const prikaziLoginPopup = ref(false)
const prikaziRegisterPopup = ref(false)
const isLoggedIn = ref(false)
const email = ref('')
const lozinka = ref('')
const ime = ref('')
const greska = ref('')
const prikaziMeni = ref(false)
const prikaziDropdown = ref(false)

const scrollToKontakt = () => {
  if (kontaktRef.value) {
    kontaktRef.value.scrollIntoView({ behavior: 'smooth' })
    const items = kontaktRef.value.querySelectorAll('.kontakt-item')
    items.forEach((el) => el.classList.add('blink'))
    setTimeout(() => {
      items.forEach((el) => el.classList.remove('blink'))
    }, 3000)
  }
}

const toggleAuthPopup = () => {
  prikaziLoginPopup.value = true
  greska.value = ''
}

const zatvoriLoginPopup = () => {
  prikaziLoginPopup.value = false
  greska.value = ''
}

const zatvoriRegisterPopup = () => {
  prikaziRegisterPopup.value = false
  greska.value = ''
}

const otvoriRegisterPopup = () => {
  prikaziLoginPopup.value = false
  prikaziRegisterPopup.value = true
  greska.value = ''
}

const registrirajSe = async () => {
  if (!ime.value || !email.value || !lozinka.value) {
    greska.value = 'Sva polja su obavezna.'
    return
  }
  if (ime.value.length > 30 || !ime.value.includes(' ')) {
    greska.value = 'Ime i prezime mora sadržavati razmak i najviše 30 znakova.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    greska.value = 'Email nije ispravan.'
    return
  }
  if (lozinka.value.length < 6 || lozinka.value.length > 20) {
    greska.value = 'Lozinka mora imati između 6 i 20 znakova.'
    return
  }
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, {
      ime: ime.value,
      email: email.value,
      lozinka: lozinka.value,
    })
    prikaziRegisterPopup.value = false
    prikaziLoginPopup.value = true
    ime.value = ''
    email.value = ''
    lozinka.value = ''
    greska.value = ''
  } catch (err) {
    greska.value = err.response?.data?.message || 'Greška pri registraciji.'
  }
}

const prijaviSe = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
      email: email.value,
      lozinka: lozinka.value,
    })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify({
  email: res.data.email,
  id: res.data.id,
  uloga: res.data.uloga,
  ime:res.data.ime
}))
    isLoggedIn.value = true
    prikaziLoginPopup.value = false
    window.location.reload()
  } catch (err) {
    greska.value = err.response?.data?.message || 'Greška pri prijavi.'
  }
}



const odjaviSe = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isLoggedIn.value = false
  ime.value = ''
  prikaziDropdown.value = false
  window.location.reload()
}


onMounted(() => {
  const stored = localStorage.getItem('token')
  const storedIme = localStorage.getItem('ime')
  if (stored && storedIme) {
    isLoggedIn.value = true
    ime.value = storedIme
  }
})
</script>

<template>
  <div>
    <nav class="bg-white border-gray-200 dark:bg-gray-900">
      <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
          <span class="self-center text-2xl font-bold whitespace-nowrap dark:text-white">
            Porsche <span class="text-[#EAA64D]">S</span>lavonija
          </span>
        </a>
        <button
          @click="prikaziMeni = !prikaziMeni"
          type="button"
          class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div :class="['w-full md:block md:w-auto', prikaziMeni ? 'block' : 'hidden']" id="navbar-default">
          <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-8 md:mt-0">
            <li><a href="/" class="nav-link" @click="prikaziMeni = false">NASLOVNA</a></li>
            <li><a href="/about" class="nav-link" @click="prikaziMeni = false">O NAMA</a></li>
            <li><a href="/cars" class="nav-link" @click="prikaziMeni = false">AUTI</a></li>
            <li><a href="/configurator" class="nav-link" @click="prikaziMeni = false">KONFIGURATOR</a></li>
            <li><button @click="scrollToKontakt(); prikaziMeni = false" class="nav-link">KONTAKT</button></li>
            <li v-if="!isLoggedIn">
              <button @click="toggleAuthPopup" class="nav-link">🔐 Prijava</button>
            </li>
            <li v-else class="relative">
              <button @click="prikaziDropdown = !prikaziDropdown" class="nav-link">👤 {{ ime }}</button>
              <div
                v-if="prikaziDropdown"
                class="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50"
              >
                <button
                  @click="odjaviSe"
                  class="block px-4 py-2 text-sm text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                >
                  Odjava
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <RouterView />

    <footer ref="kontaktRef" class="bg-white shadow dark:bg-gray-900">
      <div class="w-full max-w-screen-xl mx-auto p-4 md:py-5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 text-gray-500 dark:text-gray-400 text-sm">
            <div class="kontakt-item">📞 Nazovite nas: +385 35 943 243</div>
            <div class="kontakt-item">📧 info@porscheslavonija.hr</div>
          </div>
          <div class="text-xl font-semibold text-gray-900 dark:text-white">Porsche Slavonija</div>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 text-gray-500 dark:text-gray-400 text-sm">
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

    <div v-if="prikaziLoginPopup" class="popup">
      <div class="popup-inner">
        <button @click="zatvoriLoginPopup" class="popup-close">✖</button>
        <h2 class="popup-title">Prijava</h2>
        <form @submit.prevent="prijaviSe" class="flex flex-col gap-4">
          <input v-model="email" type="email" placeholder="Email" class="popup-input" />
          <input v-model="lozinka" type="password" placeholder="Lozinka" class="popup-input" />
          <button type="submit" class="popup-button bg-blue-600 hover:bg-blue-700">Prijavi se</button>
          <p class="text-sm text-center text-gray-600 dark:text-gray-300">
            Nemaš račun?
            <button @click.prevent="otvoriRegisterPopup" class="text-blue-600 hover:underline">Registriraj se!</button>
          </p>
          <p class="text-red-600 text-sm text-center" v-if="greska">{{ greska }}</p>
        </form>
      </div>
    </div>

    <div v-if="prikaziRegisterPopup" class="popup">
      <div class="popup-inner">
        <button @click="zatvoriRegisterPopup" class="popup-close">✖</button>
        <h2 class="popup-title">Registracija</h2>
        <form @submit.prevent="registrirajSe" class="flex flex-col gap-4">
          <input v-model="ime" type="text" placeholder="Ime i prezime" class="popup-input" />
          <input v-model="email" type="email" placeholder="Email" class="popup-input" />
          <input v-model="lozinka" type="password" placeholder="Lozinka" class="popup-input" />
          <button type="submit" class="popup-button bg-green-600 hover:bg-green-700">Registriraj se</button>
          <p class="text-red-600 text-sm text-center" v-if="greska">{{ greska }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-link {
  @apply block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent;
}
.blink {
  animation: highlight 0.6s ease-in-out 4;
}
@keyframes highlight {
  0%, 100% {
    background-color: transparent;
    color: inherit;
  }
  50% {
    background-color: #f9e7c5;
    color: #c78a3b;
  }
}
.popup {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}
.popup-inner {
  @apply bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm relative;
}
.popup-close {
  @apply absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white;
}
.popup-title {
  @apply text-2xl font-semibold mb-4 text-gray-900 dark:text-white;
}
.popup-input {
  @apply px-4 py-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600;
}
.popup-button {
  @apply text-white font-semibold px-4 py-2 rounded;
}
</style>
