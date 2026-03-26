import React from "react";

export default function MediaPage() {
  return (
    <div className="pt-20 p-8 min-h-screen bg-surface">
      {/* Header Section */}
      <section className="mb-12 flex justify-between items-end">
        <div className="max-w-2xl">
          <p className="text-tertiary font-label text-xs tracking-[0.2em] mb-2 font-bold uppercase">The Visual Archive</p>
          <h2 className="text-4xl font-serif text-primary leading-tight">Media Library</h2>
          <p className="text-on-surface-variant mt-4 font-body leading-relaxed">
            Manage the spiritual atmosphere through curated visual assets. Select categories below to filter the sacred journey highlights.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-error hover:bg-error-container/10 transition-all font-semibold">
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            Bulk Delete
          </button>
          <button className="flex items-center gap-2 px-8 py-3 bg-secondary text-on-secondary rounded-lg shadow-xl shadow-secondary/10 hover:opacity-90 transition-all font-semibold">
            <span className="material-symbols-outlined">upload</span>
            Upload New Media
          </button>
        </div>
      </section>

      {/* Categories & Filter Bar */}
      <section className="mb-8 flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold border-l-2 border-secondary">All Media</button>
          <button className="px-6 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-semibold hover:bg-surface-container-high transition-all">Hotels</button>
          <button className="px-6 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-semibold hover:bg-surface-container-high transition-all">Mekans</button>
          <button className="px-6 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-semibold hover:bg-surface-container-high transition-all">Guides</button>
        </div>
        <div className="flex items-center gap-4 text-outline text-sm">
          <span className="material-symbols-outlined">filter_list</span>
          <span>Sort by: Latest</span>
          <span className="material-symbols-outlined">grid_view</span>
        </div>
      </section>

      {/* Bento Grid Media Display */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Large Feature Item */}
        <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl bg-surface-container-lowest transition-all hover:shadow-2xl hover:shadow-primary/5">
          <img className="w-full h-full object-cover aspect-square transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCypybTbq1qphIuH4ehW4-DiFgBzw4-vrq3FybyDO6fK6HxjBFVImdxrPTkJp0IyA0zGqrb4HzU6LFWWajphI1O3HdaeQfX65tV0ldbmjbIhGAYoZFqLPZBxOHVQPsI3qerplYVtDB6aLZlFhOkuJvgkhjKHCzC-Z_jaVlU-i5MBfnDxi1dAkf3WUCIPRygvkw43jrP-z3AYISkPS8T1IbJGMvIR51rQmMosvKchdboKMccbAiYwSkzgWsNJ3EPGpzboZlRpTMkB4M" alt="Al Haram Mosque"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] bg-tertiary-fixed text-on-tertiary-fixed px-2 py-1 rounded mb-2 inline-block font-bold">MEKANS</span>
                <h3 className="text-white font-serif text-xl">The Holy Kaaba</h3>
                <p className="text-white/70 text-xs font-body">Makkah, Saudi Arabia • 4.2 MB</p>
              </div>
              <button className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <input type="checkbox" className="rounded border-white/40 bg-white/20 text-secondary focus:ring-secondary w-5 h-5"/>
          </div>
        </div>

        {/* Standard Items */}
        <div className="group relative overflow-hidden rounded-xl bg-surface-container-lowest transition-all border border-outline-variant/10">
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmKnkrbt3v7ZO9WAtyJhKQth9_V8YxiDpk__n-wTTd6Wo2q6nmBvoTXzaCVnMyqakqDKUiC19ohNdIJIx7OgKsRVqO3hDI8IVeA8xOA-DJtuN-TFK0JXgEj71c-3UHa1bxArO44SCRt1XwDUqduCX_VwKtiuJXKBWtDo3Uejod3OxfmLodpRSj-uidhHmNkZ6qQXPeg-DrEEtUDtOKSHYR6QGtLhTdz5jaTpyckq_ZmvfEgPH1GGTizaJU5JoT1P38veJjWvJhYyU" alt="Luxury Hotel Suite"/>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">Hotels</span>
              <span className="material-symbols-outlined text-outline text-sm cursor-pointer hover:text-primary">more_vert</span>
            </div>
            <h4 className="font-serif text-primary truncate">Raffles Makkah Palace</h4>
            <p className="text-[10px] text-outline mt-1 font-body">Uploaded 2 days ago</p>
          </div>
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <input type="checkbox" className="rounded border-outline-variant text-secondary focus:ring-secondary"/>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-surface-container-lowest transition-all border border-outline-variant/10">
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC235hfLs-HctdMhDkcsrkB27jfVwwr4KRC4koG1rDVPuNWjpU_tax0hDgX3blM_eeV60gnv9R4S7rBTRQ2_3JLx6WOVYyputilLb8GvpMMbTguVadJCISFsjG2aGWm6OsYBl-ibtWxp6ALGaFtq1QQsYYkLUW7WQPFgJYBajt1xvmF5lMdI6Z_kl1LHqWap8qNIAHxvA9vnngc4PeCOnckkCLTJPtmOwnW7na0hJz3ph6EmoYu3PtxAQ-c_GeqQXTKqpv6h8m3QS0" alt="Prayer Rug Details"/>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">Mekans</span>
              <span className="material-symbols-outlined text-outline text-sm cursor-pointer hover:text-primary">more_vert</span>
            </div>
            <h4 className="font-serif text-primary truncate">Masjid Nabawi Interior</h4>
            <p className="text-[10px] text-outline mt-1 font-body">Uploaded 3 days ago</p>
          </div>
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <input type="checkbox" className="rounded border-outline-variant text-secondary focus:ring-secondary"/>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-surface-container-lowest transition-all border border-outline-variant/10">
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY-GE0iUnEmIfzgGZaugwRtUjxWY0MNu3hSBqXBN-Vmt8tq-hGaAtpurp0Ess3MXctK5Mbw8sgehmhHIfBren_QRZOGM32nm_v7LRYE1onvZgwIKGP-wxicNP13VCLnzhJBHg4k5z0LUWIKXy_rUokAgBsuiJxFKZVmnhAY6H_QCf0c5FLis5vmY6jvm23zrufyV8UIDtNIs3v-X8lJdp6M4IFZY29Nu6UzzFA7a14j9fQeFRJRz1qoaDnFwqjVRGJ5EsWFRwcRIk" alt="Guide Portrait"/>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">Guides</span>
              <span className="material-symbols-outlined text-outline text-sm cursor-pointer hover:text-primary">more_vert</span>
            </div>
            <h4 className="font-serif text-primary truncate">Brother Ahmad Siddiq</h4>
            <p className="text-[10px] text-outline mt-1 font-body">Uploaded 1 week ago</p>
          </div>
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <input type="checkbox" className="rounded border-outline-variant text-secondary focus:ring-secondary"/>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-surface-container-lowest transition-all border border-outline-variant/10">
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPgYW8WdwPUqaRofdoD7YX8QRg-m9mFmyctIxPU8ps1yx78t84mOM3Ipj2ffjA61L2vrloajANoWjAQLAmbBYgUzMJZDGx7sha0Pi_g9qPHAYPtPRvRxaSWH9T_7MKMEj3S1GKigGUhJJhksZHTsiR6nnM9NLBoKhC9y348dP1j5rnxxlSSDXrEP6YB3pyRypW-J3aziWaz0w6nvwAWabh2zysBQLUcjm7lePxmJr_XU5EpQP-ERElSjRA6buH2d0_JPCFqtfI2wo" alt="Mountain Scenery"/>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">Mekans</span>
              <span className="material-symbols-outlined text-outline text-sm cursor-pointer hover:text-primary">more_vert</span>
            </div>
            <h4 className="font-serif text-primary truncate">Jabal al-Nour</h4>
            <p className="text-[10px] text-outline mt-1 font-body">Uploaded 2 weeks ago</p>
          </div>
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <input type="checkbox" className="rounded border-outline-variant text-secondary focus:ring-secondary"/>
          </div>
        </div>
      </section>
    </div>
  );
}
