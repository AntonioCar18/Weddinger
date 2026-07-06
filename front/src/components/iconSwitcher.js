import { 
    Music, 
    Flower2, 
    Camera, 
    Utensils, 
    MapPin, 
    Church, 
    Gem, 
    Car, 
    Users, 
    Sparkles, 
    Gift,
    HelpCircle 
} from "lucide-react";

const iconMap = {
    'Glazba': Music,
    'Cvijeće': Flower2,
    'Fotograf': Camera,
    'Hrana i piće': Utensils,
    'Prostor za svadbu': MapPin,
    'Crkva - svećenik': Church,
    'Nakit': Gem,
    'Prijevoz': Car,
    'Gosti': Users,
    'Uređenje prostora': Sparkles,
    'Pokloni': Gift,
    'Ostalo': HelpCircle
};

const getItemCategory = (category) => {
    return iconMap[category] || HelpCircle;
};

export default getItemCategory;