import weddingerLogo from "../assets/logo.png";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="font-display text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
);

const Bullets = ({ items }) => (
    <ul className="space-y-1.5 mt-2">
        {items.map((item, i) => (
            <li key={i} className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8926A] mt-2 shrink-0" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

const Terms = () => {
    return (
        <div className="min-h-dvh bg-[#fcfbfa] py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-[#efe9e0] p-8 md:p-12">
                <div className="text-center mb-10">
                    <img src={weddingerLogo} alt="Weddinger Logo" className="w-40 mx-auto mb-6" />
                    <h1 className="font-display text-3xl font-bold text-gray-900">Uvjeti korištenja</h1>
                    <p className="text-sm text-gray-500 mt-2">Weddinger — aplikacija za planiranje vjenčanja · vlasnik: obrt 4Solutions</p>
                </div>

                <Section title="1. Opće odredbe">
                    <p>Ovi Uvjeti korištenja uređuju odnos između obrta 4Solutions (paušalni obrt), OIB: [DOPUNITI], s kontakt adresom info@4solutions.hr (dalje: "Pružatelj usluge"), i korisnika aplikacije Weddinger (dalje: "Korisnik"). Korištenjem aplikacije Korisnik potvrđuje da je pročitao, razumio i prihvatio ove Uvjete.</p>
                </Section>

                <Section title="2. Opis usluge">
                    <p>Weddinger je web aplikacija namijenjena planiranju vjenčanja, koja korisnicima omogućuje upravljanje popisom gostiju, rasporedom sjedenja, budžetom, zadacima, dokumentima te pregled partnera (dobavljača usluga vezanih uz vjenčanja).</p>
                </Section>

                <Section title="3. Registracija i korisnički račun">
                    <p>Za korištenje usluge potrebna je registracija putem adrese e-pošte i lozinke, uz potvrdu adrese e-pošte prilikom registracije. Korisnik je dužan navesti točne podatke i odgovoran je za čuvanje povjerljivosti svoje lozinke. Korisnik je odgovoran za sve aktivnosti koje se dogode putem njegovog računa.</p>
                </Section>

                <Section title="4. Obveze korisnika">
                    <p>Korisnik se obvezuje:</p>
                    <Bullets items={[
                        "koristiti aplikaciju u skladu sa zakonom i ovim Uvjetima,",
                        "unositi točne podatke o sebi i svojim gostima,",
                        "imati odgovarajuću osnovu za unos osobnih podataka trećih osoba (gostiju) u sustav,",
                        "ne zloupotrebljavati aplikaciju (npr. pokušaje neovlaštenog pristupa, unos štetnog sadržaja i sl.).",
                    ]} />
                </Section>

                <Section title="5. Sadržaj koji učitava korisnik">
                    <p>Korisnik je isključivo odgovoran za dokumente i sadržaje koje učitava u aplikaciju. Pružatelj usluge zadržava pravo ukloniti sadržaj za koji utvrdi da krši zakon ili ove Uvjete.</p>
                </Section>

                <Section title="6. Popis partnera (dobavljača)">
                    <p>Podaci o partnerima (dobavljačima usluga za vjenčanja) prikazani u aplikaciji služe isključivo u informativne svrhe. Pružatelj usluge ne jamči točnost, dostupnost niti kvalitetu usluga navedenih partnera, te ne snosi odgovornost za bilo kakav dogovor ili transakciju između Korisnika i partnera.</p>
                </Section>

                <Section title="7. Ograničenje odgovornosti">
                    <p>Usluga se pruža "takva kakva jest" ("as is"). Pružatelj usluge ne jamči neprekidan i pogreškama slobodan rad aplikacije te ne odgovara za eventualni gubitak podataka, osim u slučaju namjere ili krajnje nepažnje. Korisniku se preporučuje da važne podatke (ugovore, dokumente) čuva i izvan aplikacije.</p>
                </Section>

                <Section title="8. Intelektualno vlasništvo">
                    <p>Sva prava na dizajn, kod i sadržaj aplikacije Weddinger (izuzev sadržaja koji učitava Korisnik) pripadaju Pružatelju usluge.</p>
                </Section>

                <Section title="9. Cijena usluge i plaćanje">
                    <p>Korištenje aplikacije Weddinger naplaćuje se jednokratno u iznosu od <strong className="text-gray-800">30 EUR</strong>. Pružatelj usluge nije u sustavu PDV-a, stoga navedeni iznos ne sadrži PDV. Nakon registracije korisničkog računa, Korisniku se izdaje ponuda s podacima za plaćanje (transakcijski račun, poziv na broj), s rokom valjanosti od <strong className="text-gray-800">7 dana</strong> od trenutka izdavanja. Pružatelj usluge zadržava pravo izmjene cijene za nove korisnike, uz odgovarajuću izmjenu ovih Uvjeta.</p>
                    <p>Korisnik ima pravo besplatno koristiti sve funkcionalnosti aplikacije tijekom probnog razdoblja od <strong className="text-gray-800">3 dana</strong> od registracije korisničkog računa. Ukoliko Korisnik ne izvrši uplatu sukladno izdanoj ponudi prije isteka roka njezine valjanosti (7 dana od registracije), korisnički račun se automatski deaktivira te Korisnik gubi pristup svim funkcionalnostima aplikacije. Ponovna aktivacija računa moguća je nakon izvršene uplate, kontaktiranjem Pružatelja usluge na info@4solutions.hr.</p>
                </Section>

                <Section title="10. Pravo na jednostrani raskid ugovora (povrat novca)">
                    <p>Korisnik koji je potrošač (fizička osoba) ima pravo, bez navođenja razloga, jednostrano raskinuti ugovor u roku od <strong className="text-gray-800">14 dana</strong> od dana sklapanja ugovora (odnosno izvršene uplate), sukladno Zakonu o zaštiti potrošača i Direktivi 2011/83/EU o pravima potrošača. Riječ je o zakonskom minimalnom roku za ugovore sklopljene na daljinu unutar Europske unije.</p>
                    <p>Za ostvarivanje ovog prava, Korisnik nas treba obavijestiti nedvosmislenom izjavom (npr. e-poštom na info@4solutions.hr) o svojoj odluci o raskidu ugovora prije isteka roka od 14 dana. Povrat plaćenog iznosa izvršit ćemo najkasnije u roku od 14 dana od dana primitka obavijesti o raskidu, istim načinom plaćanja koji je Korisnik izvorno koristio.</p>
                    <p className="italic">Napomena: ako Korisnik izričito zatraži i pristane na trenutni početak pružanja usluge prije isteka roka od 14 dana te uslugu u potpunosti iskoristi, može izgubiti pravo na jednostrani raskid sukladno članku 79. Zakona o zaštiti potrošača.</p>
                </Section>

                <Section title="11. Prekid usluge i brisanje računa">
                    <p>Korisnik može u svakom trenutku samostalno obrisati svoj korisnički račun putem postavki aplikacije, čime se trajno brišu svi povezani podaci. Pružatelj usluge zadržava pravo ukinuti pristup Korisniku koji krši ove Uvjete.</p>
                </Section>

                <Section title="12. Izmjene Uvjeta">
                    <p>Pružatelj usluge zadržava pravo izmjene ovih Uvjeta, uz obavijest Korisnicima putem aplikacije ili e-pošte. Nastavak korištenja aplikacije nakon izmjena smatra se prihvaćanjem novih Uvjeta.</p>
                </Section>

                <Section title="13. Mjerodavno pravo">
                    <p>Na ove Uvjete primjenjuje se hrvatsko pravo. Eventualni sporovi rješavat će se sporazumno, a u suprotnom pred nadležnim sudom u Republici Hrvatskoj.</p>
                </Section>

                <Section title="14. Kontakt">
                    <p>Za sva pitanja obratite nam se na info@4solutions.hr.</p>
                </Section>

                <p className="text-xs text-gray-400 italic mt-10">Datum posljednje izmjene: 7. kolovoza 2026.</p>

                <div className="text-center mt-10 pt-8 border-t border-gray-100">
                    <Link to="/login" className="text-sm font-semibold text-[#B8926A] hover:underline">
                        ← Natrag na prijavu
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Terms;
