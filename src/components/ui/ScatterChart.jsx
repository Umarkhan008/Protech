import { Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { subDays, format } from 'date-fns';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, TimeScale);

// So‘nggi 30 kunlik sanalarni ISO formatda chiqarish
const getLast30Days = () => {
    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const day = subDays(today, i);
        days.push(day.toISOString()); // ISO format kerak!
    }
    return days;
};

const ScatterChart = ({ expenses }) => {
    const labels = getLast30Days();

    const data = {
        datasets: [
            {
                label: 'Xarajatlar',
                data: (expenses || []).map((expense) => ({
                    x: new Date(expense.date).toISOString(),
                    y: expense.amount,
                })),
                backgroundColor: 'rgba(255, 99, 132, 1)',
            },
        ],
    };

    const maxAmount = Math.max(...expenses.map((e) => e.amount), 0);    

    const options = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                },
                min: labels[0],
                max: labels[labels.length - 1],
                title: {
                    display: true,
                    text: 'Sana',
                },
            },
            y: {
                beginAtZero: true,
                suggestedMax: maxAmount + 200,
                title: {
                    display: true,
                    text: 'Miqdori',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
    };

    return <Scatter data={data} options={options} />;
};

export default ScatterChart;
