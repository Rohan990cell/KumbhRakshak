import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emitSocketEvent } from '../socket';

export const getWeather = async (_req: Request, res: Response) => {
  try {
    const latest = await prisma.weatherData.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    const recent = await prisma.weatherData.findMany({
      take: 8,
      orderBy: { timestamp: 'desc' },
    });

    return res.json({
      current: latest || {
        temperature: 32.0,
        humidity: 65,
        rainMm: 0,
        windSpeedKmh: 14,
        condition: 'Clear Sky',
        weatherRisk: 'LOW',
        heatIndex: 35.5,
        visibilityKm: 7.5,
      },
      history: recent.reverse(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const simulateWeather = async (req: Request, res: Response) => {
  try {
    const { temperature, humidity, rainMm, windSpeedKmh, condition } = req.body;

    let weatherRisk = 'LOW';
    if (rainMm > 15 || temperature > 40 || windSpeedKmh > 40) weatherRisk = 'SEVERE';
    else if (rainMm > 5 || temperature > 36 || windSpeedKmh > 25) weatherRisk = 'HIGH';
    else if (rainMm > 1 || temperature > 33) weatherRisk = 'MODERATE';

    const heatIndex = temperature ? Math.round((temperature + (humidity || 60) * 0.08) * 10) / 10 : 35;

    const newRecord = await prisma.weatherData.create({
      data: {
        temperature: temperature !== undefined ? parseFloat(temperature) : 32.0,
        humidity: humidity !== undefined ? parseFloat(humidity) : 65.0,
        rainMm: rainMm !== undefined ? parseFloat(rainMm) : 0.0,
        windSpeedKmh: windSpeedKmh !== undefined ? parseFloat(windSpeedKmh) : 15.0,
        condition: condition || 'Clear Sky',
        weatherRisk,
        heatIndex,
        visibilityKm: rainMm > 10 ? 3.0 : 7.0,
      },
    });

    emitSocketEvent.weatherUpdate(newRecord);

    if (weatherRisk === 'HIGH' || weatherRisk === 'SEVERE') {
      emitSocketEvent.notificationNew({
        title: `🌧️ Weather Advisory: ${condition}`,
        message: `Rain: ${rainMm} mm, Wind: ${windSpeedKmh} km/h. High environmental slip/squall risk.`,
        category: 'Weather Warning',
        severity: weatherRisk === 'SEVERE' ? 'CRITICAL' : 'HIGH',
      });
    }

    return res.json(newRecord);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
