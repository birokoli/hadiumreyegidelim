import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departure_id = searchParams.get('departure_id');
  const arrival_id = searchParams.get('arrival_id');
  const outbound_date = searchParams.get('outbound_date');
  const return_date = searchParams.get('return_date');
  
  if (!departure_id || !arrival_id || !outbound_date) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Get API key from env or use provided default
  const apiKey = process.env.RAPIDAPI_KEY || 'ad6f06ba50msh1e1f35b839023acp128c19jsnbc1187c6fff0';

  try {
    let url = `https://google-flights2.p.rapidapi.com/api/v1/searchFlights?departure_id=${departure_id}&arrival_id=${arrival_id}&outbound_date=${outbound_date}&currency=USD`;
    if (return_date) {
      url += `&return_date=${return_date}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'google-flights2.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      },
      next: { revalidate: 3600 } // Cache results for 1 hour to save API quota
    });

    if (!response.ok) {
      throw new Error(`RapidAPI responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse Google Flights 2 schema
    if (data.status === true && data.data?.itineraries?.topFlights) {
      const flights = data.data.itineraries.topFlights.map((flightItem: any, index: number) => {
        const seg = flightItem.flights && flightItem.flights[0];
        const retSeg = flightItem.flights && flightItem.flights[1];
        const airline = seg?.airline || 'Havayolu Belirsiz';
        return {
          id: `F-${outbound_date}-${index}`,
          airline: airline,
          code: seg?.flight_number ? `${airline} ${seg.flight_number}` : airline,
          name: return_date ? `${departure_id} ⇄ ${arrival_id} (Gidiş-Dönüş)` : `${departure_id} ➔ ${arrival_id} (Tek Yön)`,
          price: flightItem.price || 0,
          departureTime: flightItem.departure_time || '',
          arrivalTime: flightItem.arrival_time || '',
          duration: flightItem.duration?.text || '',
          returnDepartureTime: retSeg ? (flightItem.return_departure_time || 'Dönüş Uçuşu') : undefined,
          returnAirline: retSeg?.airline || undefined,
          returnArrivalTime: flightItem.return_arrival_time || undefined,
          returnDuration: flightItem.return_duration?.text || undefined
        };
      });
      
      // Also merge other flights if topFlights alone are not enough
      const otherFlights = (data.data.itineraries.otherFlights || []).map((flightItem: any, index: number) => {
        const seg = flightItem.flights && flightItem.flights[0];
        const retSeg = flightItem.flights && flightItem.flights[1];
        const airline = seg?.airline || 'Havayolu Belirsiz';
        return {
          id: `O-${outbound_date}-${index}`,
          airline: airline,
          code: seg?.flight_number ? `${airline} ${seg.flight_number}` : airline,
          name: return_date ? `${departure_id} ⇄ ${arrival_id} (Gidiş-Dönüş)` : `${departure_id} ➔ ${arrival_id} (Tek Yön)`,
          price: flightItem.price || 0,
          departureTime: flightItem.departure_time || '',
          arrivalTime: flightItem.arrival_time || '',
          duration: flightItem.duration?.text || '',
          returnDepartureTime: retSeg ? (flightItem.return_departure_time || 'Dönüş Uçuşu') : undefined,
          returnAirline: retSeg?.airline || undefined,
          returnArrivalTime: flightItem.return_arrival_time || undefined,
          returnDuration: flightItem.return_duration?.text || undefined
        };
      });

      return NextResponse.json([...flights, ...otherFlights]);
    } else if (data.status === false && data.message) {
       let errorTxt = "API Error";
       if (Array.isArray(data.message)) {
          errorTxt = data.message.map((m: any) => Object.values(m)[0]).join(", ");
       } else if (typeof data.message === 'string') {
          errorTxt = data.message;
       }
       return NextResponse.json({ error: errorTxt }, { status: 400 });
    }
    
    return NextResponse.json({ error: "No flights found or API returned empty data." }, { status: 404 });
  } catch (error: any) {
    console.error("Flight fetching error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
