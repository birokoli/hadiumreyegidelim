import { create } from 'zustand';

export interface FlightOption {
  id: string;
  airline: string;
  code: string;
  name: string;
  price: number;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnDuration?: string;
  returnAirline?: string;
}

export interface HotelOption {
  id: string;
  name: string;
  pricePerNight: number;
  nights: number;
  description: string;
  extraData?: string;
}

export interface TransferOption {
  id: string;
  name: string;
  price: number;
  isRoundTrip: boolean;
  type: 'vip' | 'train';
}

export interface GuideOption {
  id: string;
  name: string;
  title: string;
  price: number;
  image: string;
}

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

interface ConfiguratorState {
  pax: number;
  flight: FlightOption | null;
  returnFlight: FlightOption | null;
  departureDate: string;
  returnDate: string;
  mekkeHotel: HotelOption | null;
  medineHotel: HotelOption | null;
  transfer: TransferOption | null;
  trains: TransferOption[];
  guide: GuideOption | null;
  extras: ExtraOption[];
  
  setPax: (pax: number) => void;
  setFlight: (flight: FlightOption | null) => void;
  setReturnFlight: (flight: FlightOption | null) => void;
  setDepartureDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setMekkeHotel: (hotel: HotelOption | null) => void;
  setMedineHotel: (hotel: HotelOption | null) => void;
  setTransfer: (transfer: TransferOption | null) => void;
  toggleTrain: (train: TransferOption) => void;
  setGuide: (guide: GuideOption | null) => void;
  toggleExtra: (extra: ExtraOption) => void;
  
  getTotalUSD: () => number;
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  pax: 2, // Default to 2
  flight: null,
  returnFlight: null,
  departureDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
  returnDate: new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0],
  mekkeHotel: null,
  medineHotel: null,
  transfer: null,
  trains: [],
  guide: null,
  extras: [],
  
  setPax: (pax) => set({ pax }),
  setFlight: (flight) => set({ flight }),
  setReturnFlight: (returnFlight) => set({ returnFlight }),
  setDepartureDate: (departureDate) => set({ departureDate }),
  setReturnDate: (returnDate) => set({ returnDate }),
  setMekkeHotel: (mekkeHotel) => set({ mekkeHotel }),
  setMedineHotel: (medineHotel) => set({ medineHotel }),
  setTransfer: (transfer) => set({ transfer }),
  toggleTrain: (train) => {
    const { trains } = get();
    const exists = trains.find((t) => t.id === train.id);
    if (exists) {
      set({ trains: trains.filter((t) => t.id !== train.id) });
    } else {
      set({ trains: [...trains, train] });
    }
  },
  setGuide: (guide) => set({ guide }),
  toggleExtra: (extra) => {
    const { extras } = get();
    const exists = extras.find((e) => e.id === extra.id);
    if (exists) {
      set({ extras: extras.filter((e) => e.id !== extra.id) });
    } else {
      set({ extras: [...extras, extra] });
    }
  },

  getTotalUSD: () => {
    const { pax, flight, returnFlight, mekkeHotel, medineHotel, transfer, trains, guide, extras } = get();
    let total = 0;
    
    // Flight is usually per person.
    if (flight) total += flight.price * pax;
    if (returnFlight) total += returnFlight.price * pax;
    
    // Hotel calculation: pricePerNight * nights * pax (per person pricing)
    if (mekkeHotel) total += mekkeHotel.pricePerNight * mekkeHotel.nights * pax;
    if (medineHotel) total += medineHotel.pricePerNight * medineHotel.nights * pax;
    
    // VIP Transfer is usually per vehicle.
    if (transfer) {
      total += transfer.price; 
    }
    
    // Trains calculation: sum of all selected items * pax
    trains.forEach((t) => {
      total += t.price * pax;
    });
    
    // Guide is total price for the trip.
    if (guide) total += guide.price;
    
    // Extras
    extras.forEach((extra) => {
      total += extra.price * pax; // Assuming extras are per person
    });
    
    // Base Service Fee removed to start at 0 USD
    // total += 150;
    
    return total;
  }
}));
