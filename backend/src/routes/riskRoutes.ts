import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { evaluateCrowdRisk } from '../services/riskService';

const router = Router();

router.get('/zones', async (_req: Request, res: Response) => {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        _count: {
          select: {
            incidents: { where: { status: { not: 'RESOLVED' } } },
          },
        },
      },
    });

    const weather = await prisma.weatherData.findFirst({ orderBy: { timestamp: 'desc' } });

    const evaluations = await Promise.all(
      zones.map(async (z) => {
        return evaluateCrowdRisk({
          zoneId: z.id,
          zoneName: z.name,
          currentCrowd: z.currentCrowd,
          capacity: z.capacity,
          densityPercent: z.density,
          inflowRate: z.inflowRate,
          outflowRate: z.outflowRate,
          temperatureC: weather?.temperature || 32,
          humidityPercent: weather?.humidity || 60,
          rainMm: weather?.rainMm || 0,
          activeIncidentsCount: z._count.incidents,
        });
      })
    );

    return res.json({
      modelArchitecture: 'KumbhRakshak Rule-Based & ML-Ready Crowd Risk Engine (Prototype)',
      evaluatedAt: new Date().toISOString(),
      evaluations,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/research-citations', (_req: Request, res: Response) => {
  return res.json({
    researchGap: 'Moving from separate monitoring/analysis approaches toward an integrated real-time emergency alert & response framework.',
    papers: [
      {
        id: 1,
        title: 'Managing Crowds with Technology: Cases of Hajj and Kumbh Mela',
        authors: 'Mohammad Yamin',
        year: 2019,
        journal: 'International Journal of Information Technology',
        doi: '10.1007/s41870-018-0266-1',
        technology: 'RFID, sensors, wireless & mobile technologies, distributed processing',
        limitation: 'Presents technology and case-based approaches rather than one complete end-to-end Kumbh emergency alert system.',
        relevance: 'Supports multi-sensor data collection, rapid information exchange, and role-based communication.',
      },
      {
        id: 2,
        title: 'Integration of Image Processing and Crowd Simulation for Understanding Crowd Dynamics in Kumbh Mela',
        authors: 'Karthika P. S., Ashish Verma, Subhadeep Pal',
        year: 2020,
        journal: 'Transportation Research Procedia',
        doi: '10.1016/j.trpro.2020.08.229',
        technology: 'Image processing, Social Force Model, crowd simulation, heat map generation',
        result: 'Pedestrian inflow from image processing was fed into simulation; average accuracy 73.45%.',
        limitation: 'Focuses on analysis/simulation rather than multi-channel emergency alert delivery.',
        relevance: 'Directly supports our CCTV crowd analysis and risk classification engine.',
      },
      {
        id: 3,
        title: 'Spatial Strategies for Crowd Management in Haridwar, India',
        authors: 'Sindhuja Kasthala, Binoy B.V., Harshit S. Lakra',
        year: 2019,
        journal: 'International Journal of Advanced Civil Engineering and Architecture Research',
        doi: '10.23953/cloud.ijacear.421',
        technology: 'GIS, remote sensing, spatial & crowd-flow analysis, emergency routes',
        limitation: 'Primarily spatial/planning based; lacks continuous live monitoring and automated alerting.',
        relevance: 'Supports GPS/location, mapping, crowd-flow and emergency-route/resource-management components.',
      },
    ],
  });
});

export default router;
