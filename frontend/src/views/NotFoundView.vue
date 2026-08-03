<template>
  <div class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
    <!-- Atmospheric Background Layers -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <!-- Subtle Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900 opacity-60"></div>
      
      <!-- Large Faded Coffee Bean Icon (Top Right) -->
      <div class="absolute -top-16 -right-16 opacity-[0.04] animate-float">
        <span class="material-symbols-outlined select-none text-[480px] text-indigo-300">local_cafe</span>
      </div>
      
      <!-- Another Faded Icon (Bottom Left) -->
      <div class="absolute -bottom-24 -left-24 opacity-[0.04] animate-float-delayed">
        <span class="material-symbols-outlined select-none text-[360px] text-amber-400">drive_file_rename_outline</span>
      </div>
    </div>

    <!-- Main Content Canvas -->
    <main class="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
      <!-- Branding Anchor -->
      <div class="mb-6 flex flex-col items-center gap-2">
        <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <span class="material-symbols-outlined text-2xl">coffee</span>
        </div>
        <h2 class="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
          Lumiére Cafe
        </h2>
      </div>

      <!-- Error Section -->
      <div class="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 flex flex-col items-center w-full">
        <!-- Large Display Typography -->
        <h1 class="text-8xl sm:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400 mb-2 select-none font-mono">
          404
        </h1>
        
        <div class="w-20 h-1 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full mb-6"></div>

        <h3 class="text-xl sm:text-2xl font-extrabold text-white mb-2">
          Oops! It looks like this brew is missing.
        </h3>

        <p class="text-xs sm:text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
          The page you are looking for has been moved, evaporated, or simply never existed in our portal.
        </p>

        <!-- Action Cluster -->
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <router-link 
            to="/" 
            class="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all duration-200 w-full sm:w-auto shadow-lg shadow-indigo-600/30"
          >
            <span class="material-symbols-outlined text-lg">dashboard</span>
            <span>Back to Main App</span>
          </router-link>

          <router-link 
            to="/pos" 
            class="flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-800 text-slate-300 font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all duration-200 w-full sm:w-auto"
          >
            <span class="material-symbols-outlined text-lg">point_of_sale</span>
            <span>Open Cashier POS</span>
          </router-link>
        </div>
      </div>

      <!-- Meta Footer Information -->
      <div class="mt-8 flex items-center gap-3 text-slate-500 text-[11px] font-mono">
        <span class="material-symbols-outlined text-sm">terminal</span>
        <span>ERR_PAGE_NOT_FOUND • HTTP 404</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}
.animate-float {
  animation: float 8s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float 10s ease-in-out infinite -2s;
}
</style>
