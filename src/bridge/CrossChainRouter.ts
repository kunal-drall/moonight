/**
 * Cross-Chain Router for Privacy Bridge
 * Finds optimal routes for private cross-chain payments
 */

import { CrossChainPaymentRoute } from '../types';

export class CrossChainRouter {
  private routeCache: Map<string, CrossChainPaymentRoute>;
  private chainConnections: Map<string, string[]>;
  private bridgeFees: Map<string, bigint>;
  
  private readonly SUPPORTED_CHAINS = ['midnight', 'ethereum', 'polygon', 'arbitrum'];
  private readonly BASE_CONFIRMATION_TIME = 60; // seconds per hop

  constructor() {
    this.routeCache = new Map();
    this.chainConnections = new Map();
    this.bridgeFees = new Map();
    
    this.initializeChainConnections();
    this.initializeBridgeFees();
  }

  /**
   * Find optimal route prioritizing speed
   */
  async findOptimalRoute(
    sourceChain: string,
    targetChain: string,
    amount: bigint
  ): Promise<CrossChainPaymentRoute> {
    if (sourceChain === targetChain) {
      throw new Error('Source and target chains cannot be the same');
    }

    const cacheKey = `${sourceChain}-${targetChain}-${amount}`;
    const cached = this.routeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const routes = await this.findAllPossibleRoutes(sourceChain, targetChain);
    if (routes.length === 0) {
      throw new Error('No route found between chains');
    }

    // Score routes based on speed and cost
    const scoredRoutes = routes.map(route => ({
      route,
      score: this.calculateRouteScore(route, amount, 'speed')
    }));

    scoredRoutes.sort((a, b) => b.score - a.score);
    const optimalRoute = scoredRoutes[0].route;

    this.routeCache.set(cacheKey, optimalRoute);
    return optimalRoute;
  }

  /**
   * Find optimal route prioritizing privacy
   */
  async findOptimalPrivacyRoute(
    sourceChain: string,
    targetChain: string,
    amount: bigint,
    maxHops: number = 4
  ): Promise<CrossChainPaymentRoute> {
    const routes = await this.findAllPossibleRoutes(sourceChain, targetChain, maxHops);
    if (routes.length === 0) {
      throw new Error('No private route found between chains');
    }

    // Score routes based on privacy features
    const scoredRoutes = routes.map(route => ({
      route,
      score: this.calculateRouteScore(route, amount, 'privacy')
    }));

    scoredRoutes.sort((a, b) => b.score - a.score);
    return scoredRoutes[0].route;
  }

  /**
   * Find multiple route options
   */
  async findMultipleRoutes(
    sourceChain: string,
    targetChain: string,
    amount: bigint,
    maxRoutes: number = 3
  ): Promise<{
    fastestRoute: CrossChainPaymentRoute;
    cheapestRoute: CrossChainPaymentRoute;
    mostPrivateRoute: CrossChainPaymentRoute;
    alternativeRoutes: CrossChainPaymentRoute[];
  }> {
    const allRoutes = await this.findAllPossibleRoutes(sourceChain, targetChain);
    
    if (allRoutes.length === 0) {
      throw new Error('No routes found');
    }

    // Calculate scores for different priorities
    const speedScores = allRoutes.map(route => ({
      route,
      score: this.calculateRouteScore(route, amount, 'speed')
    }));

    const costScores = allRoutes.map(route => ({
      route,
      score: this.calculateRouteScore(route, amount, 'cost')
    }));

    const privacyScores = allRoutes.map(route => ({
      route,
      score: this.calculateRouteScore(route, amount, 'privacy')
    }));

    // Find best routes for each category
    speedScores.sort((a, b) => b.score - a.score);
    costScores.sort((a, b) => b.score - a.score);
    privacyScores.sort((a, b) => b.score - a.score);

    const fastestRoute = speedScores[0].route;
    const cheapestRoute = costScores[0].route;
    const mostPrivateRoute = privacyScores[0].route;

    // Get alternative routes (excluding the top 3)
    const usedRoutes = new Set([
      fastestRoute.routeId,
      cheapestRoute.routeId,
      mostPrivateRoute.routeId
    ]);

    const alternativeRoutes = allRoutes
      .filter(route => !usedRoutes.has(route.routeId))
      .slice(0, maxRoutes);

    return {
      fastestRoute,
      cheapestRoute,
      mostPrivateRoute,
      alternativeRoutes
    };
  }

  /**
   * Estimate route cost
   */
  async estimateRouteCost(
    route: CrossChainPaymentRoute,
    amount: bigint
  ): Promise<{
    totalFee: bigint;
    breakdown: Array<{ hop: string; fee: bigint }>;
  }> {
    const breakdown: Array<{ hop: string; fee: bigint }> = [];
    let totalFee = BigInt(0);

    // Source to first intermediate (or direct to target)
    const firstHop = route.intermediateChains.length > 0 
      ? route.intermediateChains[0] 
      : route.targetChain;
    
    const firstFee = this.calculateBridgeFee(route.sourceChain, firstHop, amount);
    breakdown.push({ hop: `${route.sourceChain} → ${firstHop}`, fee: firstFee });
    totalFee += firstFee;

    // Intermediate hops
    for (let i = 0; i < route.intermediateChains.length - 1; i++) {
      const fromChain = route.intermediateChains[i];
      const toChain = route.intermediateChains[i + 1];
      const fee = this.calculateBridgeFee(fromChain, toChain, amount);
      
      breakdown.push({ hop: `${fromChain} → ${toChain}`, fee });
      totalFee += fee;
    }

    // Final hop to target (if intermediate chains exist)
    if (route.intermediateChains.length > 0) {
      const lastIntermediate = route.intermediateChains[route.intermediateChains.length - 1];
      const finalFee = this.calculateBridgeFee(lastIntermediate, route.targetChain, amount);
      
      breakdown.push({ hop: `${lastIntermediate} → ${route.targetChain}`, fee: finalFee });
      totalFee += finalFee;
    }

    return { totalFee, breakdown };
  }

  // Private helper methods
  private initializeChainConnections(): void {
    // Define which chains can connect directly
    this.chainConnections.set('midnight', ['ethereum', 'polygon', 'arbitrum']);
    this.chainConnections.set('ethereum', ['midnight', 'polygon', 'arbitrum']);
    this.chainConnections.set('polygon', ['midnight', 'ethereum', 'arbitrum']);
    this.chainConnections.set('arbitrum', ['midnight', 'ethereum', 'polygon']);
  }

  private initializeBridgeFees(): void {
    // Base fees for different chain pairs (in wei/smallest unit)
    this.bridgeFees.set('midnight-ethereum', BigInt('5000000000000000')); // 0.005 ETH
    this.bridgeFees.set('midnight-polygon', BigInt('2000000000000000000')); // 2 MATIC
    this.bridgeFees.set('midnight-arbitrum', BigInt('3000000000000000')); // 0.003 ETH
    this.bridgeFees.set('ethereum-polygon', BigInt('4000000000000000')); // 0.004 ETH
    this.bridgeFees.set('ethereum-arbitrum', BigInt('2000000000000000')); // 0.002 ETH
    this.bridgeFees.set('polygon-arbitrum', BigInt('1000000000000000000')); // 1 MATIC
  }

  private async findAllPossibleRoutes(
    sourceChain: string,
    targetChain: string,
    maxHops: number = 3
  ): Promise<CrossChainPaymentRoute[]> {
    const routes: CrossChainPaymentRoute[] = [];

    // Direct route
    if (this.canConnectDirectly(sourceChain, targetChain)) {
      routes.push(await this.createRoute(sourceChain, targetChain, []));
    }

    // Routes with intermediate chains
    if (maxHops > 1) {
      const intermediateRoutes = await this.findRoutesWithIntermediates(
        sourceChain,
        targetChain,
        maxHops - 1
      );
      routes.push(...intermediateRoutes);
    }

    return routes;
  }

  private async findRoutesWithIntermediates(
    sourceChain: string,
    targetChain: string,
    maxIntermediates: number
  ): Promise<CrossChainPaymentRoute[]> {
    const routes: CrossChainPaymentRoute[] = [];
    const availableChains = this.SUPPORTED_CHAINS.filter(
      chain => chain !== sourceChain && chain !== targetChain
    );

    // Single intermediate
    for (const intermediate of availableChains) {
      if (this.canConnectDirectly(sourceChain, intermediate) &&
          this.canConnectDirectly(intermediate, targetChain)) {
        routes.push(await this.createRoute(sourceChain, targetChain, [intermediate]));
      }
    }

    // Multiple intermediates (if allowed)
    if (maxIntermediates > 1) {
      // Generate combinations of intermediates
      const combinations = this.generateIntermediateCombinations(
        availableChains,
        Math.min(maxIntermediates, 2) // Limit to 2 intermediates for performance
      );

      for (const intermediates of combinations) {
        if (this.isValidIntermediateChain(sourceChain, intermediates, targetChain)) {
          routes.push(await this.createRoute(sourceChain, targetChain, intermediates));
        }
      }
    }

    return routes;
  }

  private generateIntermediateCombinations(chains: string[], maxLength: number): string[][] {
    const combinations: string[][] = [];

    // Generate permutations up to maxLength
    const generatePermutations = (current: string[], remaining: string[], maxLen: number) => {
      if (current.length === maxLen) {
        combinations.push([...current]);
        return;
      }

      for (let i = 0; i < remaining.length; i++) {
        const next = remaining[i];
        const newRemaining = remaining.filter((_, idx) => idx !== i);
        generatePermutations([...current, next], newRemaining, maxLen);
      }
    };

    for (let len = 2; len <= maxLength; len++) {
      generatePermutations([], chains, len);
    }

    return combinations;
  }

  private canConnectDirectly(chainA: string, chainB: string): boolean {
    const connections = this.chainConnections.get(chainA);
    return connections ? connections.includes(chainB) : false;
  }

  private isValidIntermediateChain(
    sourceChain: string,
    intermediates: string[],
    targetChain: string
  ): boolean {
    if (intermediates.length === 0) return true;

    // Check connection from source to first intermediate
    if (!this.canConnectDirectly(sourceChain, intermediates[0])) return false;

    // Check connections between intermediates
    for (let i = 0; i < intermediates.length - 1; i++) {
      if (!this.canConnectDirectly(intermediates[i], intermediates[i + 1])) return false;
    }

    // Check connection from last intermediate to target
    if (!this.canConnectDirectly(intermediates[intermediates.length - 1], targetChain)) return false;

    return true;
  }

  private async createRoute(
    sourceChain: string,
    targetChain: string,
    intermediateChains: string[]
  ): Promise<CrossChainPaymentRoute> {
    const routeId = await this.generateRouteId(sourceChain, targetChain, intermediateChains);
    const totalHops = intermediateChains.length + 1;
    const estimatedDelay = totalHops * this.BASE_CONFIRMATION_TIME;

    // Calculate privacy score based on route complexity
    let privacyScore = 30; // Base score
    privacyScore += intermediateChains.length * 15; // More hops = more privacy
    privacyScore += Math.min(25, Math.random() * 25); // Random factor for liquidity
    
    return {
      routeId,
      sourceChain,
      intermediateChains,
      targetChain,
      totalHops,
      estimatedDelay,
      privacyScore: Math.min(100, privacyScore)
    };
  }

  private calculateRouteScore(
    route: CrossChainPaymentRoute,
    amount: bigint,
    priority: 'speed' | 'cost' | 'privacy'
  ): number {
    let score = 0;

    switch (priority) {
      case 'speed':
        // Prefer fewer hops and faster chains
        score = 100 - (route.totalHops * 20);
        score -= Math.max(0, route.estimatedDelay - 60) / 10;
        break;

      case 'cost':
        // Estimate cost and prefer lower fees
        const estimatedCost = this.estimateRouteCostSync(route, amount);
        const costRatio = Number(estimatedCost * BigInt(1000) / amount);
        score = Math.max(0, 100 - costRatio);
        break;

      case 'privacy':
        // Prefer higher privacy scores and more complex routes
        score = route.privacyScore;
        score += Math.min(20, route.intermediateChains.length * 10);
        break;
    }

    return Math.max(0, score);
  }

  private estimateRouteCostSync(route: CrossChainPaymentRoute, amount: bigint): bigint {
    let totalCost = BigInt(0);

    // Calculate cost for each hop
    const allHops = [route.sourceChain, ...route.intermediateChains, route.targetChain];
    
    for (let i = 0; i < allHops.length - 1; i++) {
      const fromChain = allHops[i];
      const toChain = allHops[i + 1];
      totalCost += this.calculateBridgeFee(fromChain, toChain, amount);
    }

    return totalCost;
  }

  private calculateBridgeFee(fromChain: string, toChain: string, amount: bigint): bigint {
    const pairKey = `${fromChain}-${toChain}`;
    const reversePairKey = `${toChain}-${fromChain}`;
    
    const baseFee = this.bridgeFees.get(pairKey) || this.bridgeFees.get(reversePairKey) || BigInt('1000000000000000'); // 0.001 ETH default
    
    // Add percentage-based fee (0.1% of amount)
    const percentageFee = amount / BigInt(1000);
    
    return baseFee + percentageFee;
  }

  private async generateRouteId(
    sourceChain: string,
    targetChain: string,
    intermediateChains: string[]
  ): Promise<string> {
    const crypto = require('crypto');
    const routeString = [sourceChain, ...intermediateChains, targetChain].join('-');
    const hash = crypto.createHash('sha256');
    hash.update(routeString + Date.now().toString());
    return 'route_' + hash.digest('hex').substring(0, 16);
  }
}