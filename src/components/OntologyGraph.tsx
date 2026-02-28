import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface OntologyGraphProps {
  nodesData: Record<string, any>;
  edgesData: any[];
  activeNode: string;
  onNodeClick: (nodeId: string) => void;
}

export default function OntologyGraph({ nodesData, edgesData, activeNode, onNodeClick }: OntologyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);

  // Initialize and run simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const g = svg.append('g');

    // Setup zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Arrowhead marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#cbd5e1')
      .style('stroke', 'none');

    // Prepare data for D3
    const nodes = Object.values(nodesData).map(n => ({ ...n, id: n.id }));
    const links = edgesData.map(e => ({ ...e, source: e.source, target: e.target }));

    // Setup simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40));
      
    simulationRef.current = simulation;

    // Draw links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw link labels
    const linkLabel = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', '9px')
      .attr('font-weight', '500')
      .attr('fill', '#64748b')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text(d => d.label);

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('click', (event, d) => {
        onNodeClick(d.id);
      });

    // Node circles
    node.append('circle')
      .attr('r', 20)
      .attr('class', 'node-circle')
      .attr('fill', d => {
        if (d.domain === 'Design') return '#3b82f6';
        if (d.domain === 'Operations') return '#a855f7';
        if (d.domain === 'Patient Journey') return '#10b981';
        if (d.domain === 'Supply Chain') return '#f59e0b';
        return '#e2e8f0';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Node labels
    node.append('text')
      .text(d => d.id)
      .attr('class', 'node-label')
      .attr('x', 0)
      .attr('y', 32)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', '#64748b');

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Initial zoom to fit
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2));

    return () => {
      simulation.stop();
    };
  }, [nodesData, edgesData]); // Only re-run when data changes

  // Update active node styles
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    svg.selectAll('.node-circle')
      .attr('stroke', (d: any) => d.id === activeNode ? '#bfdbfe' : '#ffffff')
      .attr('stroke-width', (d: any) => d.id === activeNode ? 6 : 2)
      .attr('fill', (d: any) => {
        if (d.id === activeNode) return '#2563eb';
        if (d.domain === 'Design') return '#3b82f6';
        if (d.domain === 'Operations') return '#a855f7';
        if (d.domain === 'Patient Journey') return '#10b981';
        if (d.domain === 'Supply Chain') return '#f59e0b';
        return '#e2e8f0';
      });

    svg.selectAll('.node-label')
      .attr('font-weight', (d: any) => d.id === activeNode ? '700' : '500')
      .attr('fill', (d: any) => d.id === activeNode ? '#0f172a' : '#64748b');

  }, [activeNode]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] bg-white/60 rounded-xl border border-purple-100 shadow-sm overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg border border-purple-100 shadow-sm backdrop-blur-sm text-xs text-slate-500 pointer-events-none">
        <p>Scroll to zoom</p>
        <p>Drag to pan/move nodes</p>
      </div>
    </div>
  );
}
