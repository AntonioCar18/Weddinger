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

const Privacy = () => {
    return (
        <div className="min-h-dvh bg-[#fcfbfa] py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-[#efe9e0] p-8 md:p-12">
                <div className="text-center mb-10">
                    <img src={weddingerLogo} alt="Weddinger Logo" className="w-40 mx-auto mb-6" />
                    <h1 className="font-display text-3xl font-bold text-gray-900">Politika privatnosti</h1>
                    <p className="text-sm text-gray-500 mt-2">Weddinger — aplikacija za planiranje vjenčanja · vlasnik: obrt 4Solutions</p>
                </div>

                <Section title="1. Voditelj obrade podataka">
                    <p>Voditelj obrade osobnih podataka je obrt 4Solutions (paušalni obrt), s kontakt adresom elektroničke pošte info@4solutions.hr. Za sva pitanja vezana uz obradu osobnih podataka i ostvarivanje Vaših prava, možete nas kontaktirati na navedenu adresu.</p>
                </Section>

                <Section title="2. Koje podatke prikupljamo">
                    <p>Prilikom korištenja aplikacije Weddinger prikupljamo sljedeće kategorije podataka:</p>
                    <Bullets items={[
                        "Podaci o korisničkom računu: adresa elektroničke pošte, lozinka (pohranjena isključivo u kriptiranom/hashiranom obliku), imena partnera, dodatna adresa e-pošte partnera, datum zaruka, datum vjenčanja, lokacija vjenčanja.",
                        "Podaci o gostima: ime i prezime gosta, broj mobitela, status dolaska, odabir menija, napomene/alergije, raspored za stolom. Ove podatke u sustav unosi korisnik (mladenka/mladoženja), a ne sami gosti.",
                        "Podaci o budžetu: stavke troškova, iznosi, status plaćanja, napomene.",
                        "Podaci o zadacima: nazivi zadataka, kategorije, rokovi, status izvršenja.",
                        "Dokumenti: datoteke koje korisnik učita u sustav (npr. ugovori, ponude) u PDF ili Word formatu.",
                        "Tehnički podaci: kolačić (cookie) za autentifikaciju korisničke sesije.",
                    ]} />
                </Section>

                <Section title="3. Svrha i pravna osnova obrade">
                    <p>Podatke obrađujemo radi:</p>
                    <Bullets items={[
                        "izvršavanja ugovora, odnosno pružanja usluge planiranja vjenčanja koju ste zatražili (čl. 6. st. 1. t. b) Opće uredbe o zaštiti podataka),",
                        "ispunjavanja Vašeg zahtjeva prilikom registracije (privola),",
                        "osiguravanja sigurnosti sustava i sprječavanja zlouporabe (legitimni interes).",
                    ]} />
                </Section>

                <Section title="4. Podaci o gostima (obrada u Vaše ime)">
                    <p>Kada u aplikaciju unosite podatke o svojim gostima (ime, telefon, napomene i sl.), Vi ste u tom odnosu voditelj obrade tih podataka, a Weddinger (4Solutions) djeluje kao izvršitelj obrade u Vaše ime. Odgovorni ste osigurati da imate odgovarajuću osnovu za dijeljenje podataka Vaših gostiju s nama (npr. njihov pristanak ili legitimnu potrebu organizacije vjenčanja).</p>
                </Section>

                <Section title="5. Pohrana i sigurnost podataka">
                    <p>Podaci se pohranjuju na poslužiteljima tvrtke Hetzner Online GmbH, koja ujedno pruža i uslugu elektroničke pošte koju koristimo za komunikaciju s Vama. Dokumenti koje učitate pohranjuju se putem MinIO sustava za pohranu objekata, koji je samostalno postavljen na istom poslužitelju i nije dostupan trećim stranama. Lozinke se pohranjuju isključivo u kriptiranom (hashiranom) obliku i nikada nisu vidljive u čitljivom obliku, čak ni našem osoblju.</p>
                    <p>Sva komunikacija između Vašeg uređaja i naših poslužitelja odvija se putem šifrirane HTTPS (TLS/SSL) veze, čime se podaci štite od neovlaštenog pristupa tijekom prijenosa.</p>
                </Section>

                <Section title="6. Kolačići (cookies)">
                    <p>Aplikacija koristi jedan tehnički nužan kolačić koji služi isključivo za održavanje Vaše prijavljene sesije (autentifikacija). Ovaj kolačić ne koristi se za praćenje ili oglašavanje, te sukladno propisima ne zahtijeva prethodnu privolu.</p>
                </Section>

                <Section title="7. Dijeljenje podataka s trećim stranama">
                    <p>Vaše podatke ne prodajemo niti dijelimo s trećim stranama u marketinške svrhe. Podaci se dijele isključivo s pružateljem hosting usluge (Hetzner Online GmbH) u mjeri u kojoj je to nužno za tehničko funkcioniranje usluge.</p>
                </Section>

                <Section title="8. Razdoblje čuvanja podataka">
                    <p>Podatke čuvamo dok god je Vaš korisnički račun aktivan. Svoj račun i sve povezane podatke možete u svakom trenutku sami trajno obrisati putem postavki aplikacije, nakon čega se podaci brišu iz sustava.</p>
                </Section>

                <Section title="9. Vaša prava">
                    <p>Sukladno Općoj uredbi o zaštiti podataka (GDPR), imate pravo na: pristup svojim podacima, ispravak netočnih podataka, brisanje podataka, ograničenje obrade, prenosivost podataka te prigovor na obradu. Zahtjeve možete uputiti na info@4solutions.hr. Također imate pravo podnijeti pritužbu Agenciji za zaštitu osobnih podataka (AZOP), www.azop.hr.</p>
                </Section>

                <Section title="10. Izmjene ove politike">
                    <p>Ovu politiku privatnosti možemo povremeno ažurirati. O značajnijim izmjenama obavijestit ćemo Vas putem aplikacije ili e-pošte.</p>
                </Section>

                <Section title="11. Kontakt">
                    <p>Za sva pitanja vezana uz privatnost, obratite nam se na info@4solutions.hr.</p>
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

export default Privacy;
