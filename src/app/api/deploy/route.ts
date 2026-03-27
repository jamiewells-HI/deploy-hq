import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Make sure this path applies

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { repo, branch, projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Insert the Real Database Record exactly as requested!
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        status: 'BUILDING', // It starts Building!
        commitHash: Math.random().toString(36).substring(2, 9),
        buildLogs: '> Preparing build environment...\n'
      }
    });

    // Simulated Asynchronous Pipeline
    // In production, this would be a real job queue like BullMQ streaming logs via WebSocket or DB appends
    const appendLog = async (text: string) => {
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          buildLogs: {
            // Prisma string concatenation trick when appending: we can read and update, or just fetch then save
            // Let's just fetch latest, then update to be safe
          }
        }
      });
    };

    // A simpler approach for the mock: an async loop writing to DB
    // Turbo-Charged Simulation
    setTimeout(async () => {
      const logs = [
        '> [Cloudflare Pages] Cloning repository...',
        '> [Cloudflare Pages] Using cached node_modules',
        '> npm run build',
        '  Creating an optimized production build...',
        '  ✓ Compiled successfully',
        '> [Cloudflare Pages] Deploying to edge storage...',
        '  ✓ Site is live at edge!'
      ];
      
      let currentLog = '> Preparing build environment...\n';
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      const projectName = project?.name || 'project';
      
      for (let i = 0; i < logs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 700)); // Faster 0.7s pulses
        currentLog += logs[i] + '\n';
        
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: { buildLogs: currentLog }
        });
      }

      // Finalize with Success and URL!
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { 
          status: 'SUCCESS', 
          deploymentUrl: `https://${projectName.toLowerCase()}.pages.dev` 
        }
      });
      
      console.log(`[Deployment] Project ${projectId} successfully deployed.`);
    }, 200);

    return NextResponse.json({
      success: true,
      deploymentId: deployment.id,
      status: 'BUILDING',
      message: 'Deployment to Cloudflare Pages queued successfully.',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error processing deploy request' },
      { status: 500 }
    );
  }
}
