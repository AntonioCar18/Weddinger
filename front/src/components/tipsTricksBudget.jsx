import { Lightbulb, Wallet, Heart, CalendarCheck, Users } from 'lucide-react';
import TipsTricks from './tips&tricks';

const TipsTricksBudget = () => {
    return (
        <div className='flex flex-col bg-white p-8 shadow rounded-2xl w-full mx-auto'>
            <div className='flex items-center mb-8 pb-2'>
                <div className='flex flex-col gap-2'>
                    <h2 className='font-bold text-2xl text-gray-800'>Tips & Tricks</h2>
                    <p className='text-[13px] text-gray-500'>
                        Svjesni smo koliko stresan može biti period planiranja vjenčanja. Pročitajte neke od naših savjeta za koje vjerujemo da Vam mogu biti od pomoći.
                    </p>
                </div>
            </div>

            <div className='flex flex-col gap-8'>
                <TipsTricks 
                    Icon={Wallet} 
                    title="Pravilo 10-15% rezervne" 
                    desc="Uvijek ostavite 10-15% budžeta sa strane za nepredviđene troškove. To će vas spasiti stresa u zadnji čas." 
                />
                
                <TipsTricks 
                    Icon={Heart} 
                    title="Odredite prioritete" 
                    desc="Zapišite 3 stvari koje su vam najvažnije i na njih usmjerite većinu budžeta i pažnje." 
                />

                <TipsTricks 
                    Icon={CalendarCheck} 
                    title="Završne potvrde" 
                    desc="Sve dogovore s dobavljačima finalizirajte najkasnije 3 mjeseca prije datuma vjenčanja." 
                />

                <TipsTricks 
                    Icon={Users} 
                    title="Kvaliteta iznad kvantitete" 
                    desc="Pozovite ljude uz koje se zaista osjećate ugodno i s kojima želite podijeliti svoj trenutak." 
                />
            </div>
        </div>
    );
}

export default TipsTricksBudget;