const BudgetCard = ({title, amount}) => {
    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                {title}
            </h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">
                {amount}
            </p>
        </div>
    );
}

export default BudgetCard;