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

        <div v-if="loading" class="text-left inline-block bg-gray-200 text-gray-800 px-3 py-2 rounded-xl italic">
          AI piše<span class="dots"><span>.</span><span>.</span><span>.</span></span>
        </div>

        <form @submit.prevent="posaljiUpit" class="p-2 border-t flex gap-2">
          <input
            v-model="trenutniUpit"
            type="text"
            placeholder="Pitaj nešto o autima..."
            class="flex-1 border rounded px-3 py-1 text-sm focus:outline-none"
            :disabled="loading"
          />
          <button :disabled="loading || !trenutniUpit.trim()" type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">
            Pošalji
          </button>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
const route = useRoute()
const router = useRouter()
const modeli = ref([])
const odabraniModel = ref(null)
const podmodeli = ref(null)
const loading = ref(false)

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
   if (route.query.prikaziChat === 'true') {
    prikaziChat.value = true
  }
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

const getPovijestPoruka = () => {
  return poruke.value
    .filter(m => m.rola === "korisnik" || m.rola === "ai")
    .map(m => ({
      role: m.rola === "korisnik" ? "user" : "assistant",
      content: m.tekst
    }));
}

function extractJSON(text) {
  try {
    // Pronađi dio između ```json ... ```
    const match = text.match(/```json([\s\S]*?)```/i);
    if (match) {
      return JSON.parse(match[1].trim());
    }

    // Ako nema ```json, pokušaj direktno parsati
    return JSON.parse(text.trim());
  } catch {
    return null;
  }
}


const posaljiUpit = async () => {
  if (!trenutniUpit.value.trim() || loading.value) return;

  loading.value = true;

  poruke.value.push({ rola: 'korisnik', tekst: trenutniUpit.value });

  try {
    const odgovor = await axios.post('http://localhost:5000/api/ai-konfiguracija', {
      zahtjev: trenutniUpit.value,
      povijest: getPovijestPoruka()
    });

    if (odgovor.data.done) {
      poruke.value.push({ rola: 'ai', tekst: 'Konfiguracija je spremna.' });

      router.push({
        name: "confcar",
        query: {
          data: JSON.stringify(odgovor.data.konfiguracija)
        }
      });
    } else {
      const jsonKonfig = extractJSON(odgovor.data.odgovor);

      if (jsonKonfig && jsonKonfig.naziv && jsonKonfig.preporucena_motorizacija) {
        poruke.value.push({ rola: 'ai', tekst: 'Konfiguracija je prepoznata i spremna.' });

        router.push({
          name: "confcar",
          query: {
            data: JSON.stringify(jsonKonfig)
          }
        });
      } else {
        poruke.value.push({ rola: 'ai', tekst: odgovor.data.odgovor });
      }
    }
  } catch (err) {
    console.error(err);
    poruke.value.push({ rola: 'ai', tekst: '⚠️ Nedam više para za AI.' });
  } finally {
    loading.value = false;
    trenutniUpit.value = '';
  }
};




</script>

<style scoped>
img {
  pointer-events: none;
}
@keyframes blink {
  0%, 20% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}
.dots span {
  animation-name: blink;
  animation-duration: 1.4s;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}
.dots span:nth-child(1) {
  animation-delay: 0s;
}
.dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.dots span:nth-child(3) {
  animation-delay: 0.4s;
}
</style>
