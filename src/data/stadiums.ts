// Dane zamockowane — do podmiany na endpointy backendu.
// Kształt zweryfikowany z migracją 20260522120000_create_stadiums_table.js
// i ze StadiumsController (GET /api/stadiums, GET /api/stadiums/:id).

import type { Stadium } from "./types"

// Jeden stadion na drużynę, id trzyma się id drużyny z teams.ts.
// Zapis seedowy (bez powtarzanych created_at/updated_at), bo przy 76 wierszach
// pełne obiekty były nieczytelne.
type StadiumSeed = Omit<Stadium, "created_at" | "updated_at">

const stadiumSeeds: StadiumSeed[] = [
  // Ekstraklasa
  { id: 1, name: "Stadion Wojska Polskiego", city: "Warsaw", capacity: 31103, longitude: 21.0206, latitude: 52.2251, address: "ul. Łazienkowska 3, Warszawa" },
  { id: 2, name: "Enea Stadion", city: "Poznań", capacity: 42837, longitude: 16.8992, latitude: 52.4064, address: "ul. Bułgarska 5/7, Poznań" },
  { id: 11, name: "Stadion Miejski w Częstochowie", city: "Częstochowa", capacity: 5500, longitude: 19.1203, latitude: 50.8118, address: "ul. Limanowskiego 83, Częstochowa" },
  { id: 12, name: "Stadion im. Floriana Krygiera", city: "Szczecin", capacity: 21163, longitude: 14.5238, latitude: 53.4053, address: "ul. Karłowicza 28, Szczecin" },
  { id: 13, name: "Stadion Miejski w Białymstoku", city: "Białystok", capacity: 22386, longitude: 23.1697, latitude: 53.1043, address: "ul. Słoneczna 1, Białystok" },
  { id: 14, name: "Arena Zabrze", city: "Zabrze", capacity: 24563, longitude: 18.7852, latitude: 50.3106, address: "ul. Roosevelta 81, Zabrze" },
  { id: 25, name: "Stadion Cracovii im. Józefa Piłsudskiego", city: "Kraków", capacity: 15114, longitude: 19.9247, latitude: 50.0596, address: "ul. Kałuży 1, Kraków" },
  { id: 26, name: "Stadion Widzewa", city: "Łódź", capacity: 18018, longitude: 19.4989, latitude: 51.7476, address: "al. Piłsudskiego 138, Łódź" },
  { id: 33, name: "Tarczyński Arena Wrocław", city: "Wrocław", capacity: 45105, longitude: 16.9345, latitude: 51.1417, address: "al. Śląska 1, Wrocław" },
  { id: 34, name: "Polsat Plus Arena Gdańsk", city: "Gdańsk", capacity: 41620, longitude: 18.5614, latitude: 54.3925, address: "ul. Pokoleń Lechii Gdańsk 1, Gdańsk" },
  { id: 35, name: "Stadion Miejski w Gliwicach", city: "Gliwice", capacity: 10037, longitude: 18.6702, latitude: 50.2945, address: "ul. Okrzei 20, Gliwice" },
  { id: 36, name: "Stadion Zagłębia Lubin", city: "Lubin", capacity: 16068, longitude: 16.1975, latitude: 51.3969, address: "ul. M. Skłodowskiej-Curie 98, Lubin" },
  { id: 37, name: "Stadion im. Braci Czachorów", city: "Radom", capacity: 8100, longitude: 21.144, latitude: 51.396, address: "ul. Struga 63, Radom" },
  { id: 38, name: "Suzuki Arena", city: "Kielce", capacity: 15550, longitude: 20.63, latitude: 50.866, address: "ul. Ściegiennego 8, Kielce" },
  { id: 39, name: "Arena Lublin", city: "Lublin", capacity: 15500, longitude: 22.543, latitude: 51.23, address: "ul. Stadionowa 1, Lublin" },
  { id: 40, name: "Stadion Miejski w Mielcu", city: "Mielec", capacity: 6864, longitude: 21.43, latitude: 50.287, address: "ul. Solskiego 1, Mielec" },
  { id: 41, name: "Stadion GKS Katowice", city: "Katowice", capacity: 14000, longitude: 19.002, latitude: 50.26, address: "ul. Bukowa 1, Katowice" },
  { id: 42, name: "Stadion Puszczy Niepołomice", city: "Niepołomice", capacity: 2600, longitude: 20.217, latitude: 50.035, address: "ul. Bocheńska 20, Niepołomice" },

  // LaLiga
  { id: 3, name: "Santiago Bernabéu", city: "Madrid", capacity: 78297, longitude: -3.6883, latitude: 40.4531, address: "Av. de Concha Espina, 1, Madrid" },
  { id: 4, name: "Camp Nou", city: "Barcelona", capacity: 99354, longitude: 2.1228, latitude: 41.3809, address: "C. d'Arístides Maillol, 12, Barcelona" },
  { id: 5, name: "Estadio Metropolitano", city: "Madrid", capacity: 68456, longitude: -3.5995, latitude: 40.4362, address: "Av. de Luis Aragonés, 4, Madrid" },
  { id: 15, name: "Ramón Sánchez-Pizjuán", city: "Sevilla", capacity: 43883, longitude: -5.9706, latitude: 37.3841, address: "C. Sevilla Fútbol Club, 41005 Sevilla" },
  { id: 16, name: "Mestalla", city: "Valencia", capacity: 49430, longitude: -0.3583, latitude: 39.4747, address: "Av. de Suècia, s/n, 46010 València" },
  { id: 17, name: "Reale Arena", city: "San Sebastián", capacity: 39500, longitude: -1.9737, latitude: 43.3013, address: "Paseo de Anoeta, 1, 20014 Donostia" },
  { id: 27, name: "San Mamés", city: "Bilbao", capacity: 53289, longitude: -2.9496, latitude: 43.2641, address: "Rafael Moreno Pitxitxi Kalea, 48013 Bilbo" },
  { id: 28, name: "Estadio de la Cerámica", city: "Villarreal", capacity: 23500, longitude: -0.1036, latitude: 39.944, address: "Plaça de Labrador, s/n, 12540 Vila-real" },
  { id: 43, name: "Estadio Benito Villamarín", city: "Sevilla", capacity: 60721, longitude: -5.9817, latitude: 37.3564, address: "Av. de Heliópolis, s/n, 41012 Sevilla" },
  { id: 44, name: "Estadio de Balaídos", city: "Vigo", capacity: 29000, longitude: -8.74, latitude: 42.212, address: "Av. de Balaídos, s/n, 36210 Vigo" },
  { id: 45, name: "Estadi Montilivi", city: "Girona", capacity: 14624, longitude: 2.828, latitude: 41.961, address: "Av. Montilivi, 141, 17003 Girona" },
  { id: 46, name: "Estadio de Vallecas", city: "Madrid", capacity: 14708, longitude: -3.6586, latitude: 40.3919, address: "C. del Payaso Fofó, s/n, 28018 Madrid" },
  { id: 47, name: "El Sadar", city: "Pamplona", capacity: 23576, longitude: -1.637, latitude: 42.7963, address: "C. Sadar, s/n, 31006 Pamplona" },
  { id: 48, name: "Coliseum", city: "Getafe", capacity: 17393, longitude: -3.7148, latitude: 40.3259, address: "Av. Teresa de Calcuta, s/n, 28903 Getafe" },
  { id: 49, name: "Estadi Mallorca Son Moix", city: "Palma", capacity: 23142, longitude: 2.63, latitude: 39.59, address: "Camí dels Reis, s/n, 07011 Palma" },
  { id: 50, name: "Mendizorroza", city: "Vitoria-Gasteiz", capacity: 19840, longitude: -2.69, latitude: 42.837, address: "C. Cervantes, s/n, 01007 Vitoria-Gasteiz" },
  { id: 51, name: "RCDE Stadium", city: "Barcelona", capacity: 40000, longitude: 2.075, latitude: 41.3475, address: "Av. del Baix Llobregat, 100, 08940 Cornellà" },
  { id: 52, name: "Estadio José Zorrilla", city: "Valladolid", capacity: 27618, longitude: -4.761, latitude: 41.645, address: "Av. del Mundial 82, s/n, 47014 Valladolid" },
  { id: 53, name: "Estadio de Gran Canaria", city: "Las Palmas", capacity: 32400, longitude: -15.456, latitude: 28.1, address: "C. Fondos de Segura, s/n, 35019 Las Palmas" },
  { id: 54, name: "Estadio Butarque", city: "Leganés", capacity: 12454, longitude: -3.759, latitude: 40.34, address: "Av. Reina Sofía, 27, 28911 Leganés" },

  // Premier League
  { id: 6, name: "Emirates Stadium", city: "London", capacity: 60704, longitude: -0.1085, latitude: 51.5549, address: "Hornsey Rd, London N7 7AJ" },
  { id: 7, name: "Anfield", city: "Liverpool", capacity: 61276, longitude: -2.9608, latitude: 53.4308, address: "Anfield Rd, Liverpool L4 0TH" },
  { id: 8, name: "Etihad Stadium", city: "Manchester", capacity: 53400, longitude: -2.2004, latitude: 53.4831, address: "Etihad Campus, Manchester M11 3FF" },
  { id: 18, name: "Old Trafford", city: "Manchester", capacity: 74310, longitude: -2.2913, latitude: 53.4631, address: "Sir Matt Busby Way, Manchester M16 0RA" },
  { id: 19, name: "Stamford Bridge", city: "London", capacity: 40343, longitude: -0.191, latitude: 51.4817, address: "Fulham Rd, London SW6 1HS" },
  { id: 20, name: "St James' Park", city: "Newcastle", capacity: 52305, longitude: -1.6216, latitude: 54.9756, address: "Barrack Rd, Newcastle upon Tyne NE1 4ST" },
  { id: 29, name: "Tottenham Hotspur Stadium", city: "London", capacity: 62850, longitude: -0.0664, latitude: 51.6043, address: "782 High Rd, London N17 0BX" },
  { id: 30, name: "Villa Park", city: "Birmingham", capacity: 42682, longitude: -1.8848, latitude: 52.5092, address: "Trinity Rd, Birmingham B6 6HE" },
  { id: 55, name: "American Express Stadium", city: "Brighton", capacity: 31800, longitude: -0.0837, latitude: 50.8616, address: "Village Way, Brighton BN1 9BL" },
  { id: 56, name: "London Stadium", city: "London", capacity: 62500, longitude: -0.0166, latitude: 51.5387, address: "Queen Elizabeth Olympic Park, London E20 2ST" },
  { id: 57, name: "Goodison Park", city: "Liverpool", capacity: 39414, longitude: -2.9664, latitude: 53.4388, address: "Goodison Rd, Liverpool L4 4EL" },
  { id: 58, name: "Selhurst Park", city: "London", capacity: 25486, longitude: -0.0855, latitude: 51.3983, address: "Holmesdale Rd, London SE25 6PU" },
  { id: 59, name: "Craven Cottage", city: "London", capacity: 29589, longitude: -0.2217, latitude: 51.4749, address: "Stevenage Rd, London SW6 6HH" },
  { id: 60, name: "Gtech Community Stadium", city: "London", capacity: 17250, longitude: -0.2889, latitude: 51.4907, address: "166 Lionel Rd N, Brentford TW8 9RR" },
  { id: 61, name: "Molineux Stadium", city: "Wolverhampton", capacity: 31750, longitude: -2.1302, latitude: 52.5902, address: "Waterloo Rd, Wolverhampton WV1 4QR" },
  { id: 62, name: "City Ground", city: "Nottingham", capacity: 30404, longitude: -1.1327, latitude: 52.94, address: "Pavilion Rd, West Bridgford NG2 5FJ" },
  { id: 63, name: "Vitality Stadium", city: "Bournemouth", capacity: 11307, longitude: -1.8384, latitude: 50.7348, address: "Dean Court, Bournemouth BH7 7AF" },
  { id: 64, name: "King Power Stadium", city: "Leicester", capacity: 32262, longitude: -1.1422, latitude: 52.6204, address: "Filbert Way, Leicester LE2 7FL" },
  { id: 65, name: "St Mary's Stadium", city: "Southampton", capacity: 32384, longitude: -1.3911, latitude: 50.9058, address: "Britannia Rd, Southampton SO14 5FP" },
  { id: 66, name: "Portman Road", city: "Ipswich", capacity: 30311, longitude: 1.145, latitude: 52.055, address: "Portman Rd, Ipswich IP1 2DA" },

  // Bundesliga
  { id: 9, name: "Allianz Arena", city: "Munich", capacity: 75024, longitude: 11.6247, latitude: 48.2188, address: "Werner-Heisenberg-Allee 25, München" },
  { id: 10, name: "Signal Iduna Park", city: "Dortmund", capacity: 81365, longitude: 7.4517, latitude: 51.4926, address: "Strobelallee 50, Dortmund" },
  { id: 21, name: "Red Bull Arena", city: "Leipzig", capacity: 47069, longitude: 12.3483, latitude: 51.3459, address: "Am Sportforum 3, Leipzig" },
  { id: 22, name: "BayArena", city: "Leverkusen", capacity: 30210, longitude: 7.0022, latitude: 51.0382, address: "Bismarckstraße 122-124, Leverkusen" },
  { id: 23, name: "Deutsche Bank Park", city: "Frankfurt", capacity: 58000, longitude: 8.6455, latitude: 50.0685, address: "Mörfelder Landstraße 362, Frankfurt am Main" },
  { id: 24, name: "MHPArena", city: "Stuttgart", capacity: 60449, longitude: 9.232, latitude: 48.7924, address: "Mercedesstraße 87, Stuttgart" },
  { id: 31, name: "Weserstadion", city: "Bremen", capacity: 42100, longitude: 8.8378, latitude: 53.0664, address: "Franz-Böhmert-Straße 1c, Bremen" },
  { id: 32, name: "Volkswagen Arena", city: "Wolfsburg", capacity: 30000, longitude: 10.8038, latitude: 52.4327, address: "In den Allerwiesen 1, Wolfsburg" },
  { id: 67, name: "Borussia-Park", city: "Mönchengladbach", capacity: 54042, longitude: 6.3853, latitude: 51.1745, address: "Hennes-Weisweiler-Allee 1, Mönchengladbach" },
  { id: 68, name: "Stadion An der Alten Försterei", city: "Berlin", capacity: 22012, longitude: 13.5683, latitude: 52.4573, address: "An der Wuhlheide 263, Berlin" },
  { id: 69, name: "Europa-Park Stadion", city: "Freiburg", capacity: 34700, longitude: 7.829, latitude: 48.0217, address: "Achim-Stocker-Straße 1, Freiburg im Breisgau" },
  { id: 70, name: "PreZero Arena", city: "Sinsheim", capacity: 30150, longitude: 8.8875, latitude: 49.2386, address: "Dietmar-Hopp-Straße 1, Sinsheim" },
  { id: 71, name: "Mewa Arena", city: "Mainz", capacity: 33305, longitude: 8.2245, latitude: 49.9841, address: "Eugen-Salomon-Straße 1, Mainz" },
  { id: 72, name: "WWK Arena", city: "Augsburg", capacity: 30660, longitude: 10.886, latitude: 48.3232, address: "Bürgermeister-Ulrich-Straße 90, Augsburg" },
  { id: 73, name: "Vonovia Ruhrstadion", city: "Bochum", capacity: 26000, longitude: 7.2367, latitude: 51.4897, address: "Castroper Straße 145, Bochum" },
  { id: 74, name: "Voith-Arena", city: "Heidenheim", capacity: 15000, longitude: 10.139, latitude: 48.668, address: "Schlossstraße 70, Heidenheim an der Brenz" },
  { id: 75, name: "Millerntor-Stadion", city: "Hamburg", capacity: 29546, longitude: 9.9678, latitude: 53.5546, address: "Harald-Stender-Platz 1, Hamburg" },
  { id: 76, name: "Holstein-Stadion", city: "Kiel", capacity: 15034, longitude: 10.123, latitude: 54.349, address: "Westring 501, Kiel" },
]

export const stadiums: Stadium[] = stadiumSeeds.map((seed) => ({
  ...seed,
  created_at: "2026-01-10T09:00:00.000Z",
  updated_at: "2026-01-10T09:00:00.000Z",
}))
