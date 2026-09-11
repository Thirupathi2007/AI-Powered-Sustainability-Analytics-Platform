# Decarbonization Recommendation Engine
def generate_recommendations(inputs, predicted_tier, annual_carbon_mt):
    recs = []
    
    renewable_pct = float(inputs.get('renewable_energy_pct', 0))
    equip_rating = float(inputs.get('equipment_efficiency_rating', 3.0))
    waste_pct = float(inputs.get('waste_recycled_pct', 0))
    peak_factor = float(inputs.get('peak_load_factor', 0.5))
    monthly_kwh = float(inputs.get('monthly_energy_kwh', 10000))
    fuel_liters = float(inputs.get('fuel_consumed_liters', 0))
    water_m3 = float(inputs.get('water_usage_m3', 0))
    
    total_est_reduction_mt = 0.0
    total_est_cost_savings_usd = 0.0
    
    # 1. Renewable Energy Transition
    if renewable_pct < 55:
        target_increase = 75 - renewable_pct
        annual_grid_kwh = (monthly_kwh * 12) * (1 - renewable_pct / 100.0)
        co2_saved = (annual_grid_kwh * (target_increase / 100.0) * 0.42) / 1000.0
        dollar_saved = (annual_grid_kwh * (target_increase / 100.0)) * 0.045
        
        recs.append({
            'id': 'rec_renewable_ppa',
            'title': 'Deploy On-site Solar and Corporate Power Purchase Agreement (PPA)',
            'timeframe': 'Strategic (6 - 12 months)',
            'category': 'Scope 2 Decarbonization',
            'impact_level': 'Critical',
            'badge_color': 'emerald',
            'co2_reduction_mt': round(co2_saved, 1),
            'cost_savings_usd': int(dollar_saved),
            'payback_period_years': 2.8,
            'description': f'Your current renewable share ({renewable_pct:.1f}%) is below the top quartile benchmark (75%). Transitioning to a PPA or on-site solar eliminates approximately {co2_saved:.1f} MT CO2e annually.'
        })
        total_est_reduction_mt += co2_saved
        total_est_cost_savings_usd += dollar_saved

    # 2. Equipment Efficiency and VFD Retrofits
    if equip_rating < 3.8:
        elec_savings = (monthly_kwh * 12) * 0.18
        co2_saved = (elec_savings * 0.42) / 1000.0
        dollar_saved = elec_savings * 0.12
        
        recs.append({
            'id': 'rec_vfd_retrofits',
            'title': 'Retrofit HVAC and Industrial Compressors with Variable Frequency Drives',
            'timeframe': 'Quick Win (< 6 months)',
            'category': 'Energy Efficiency',
            'impact_level': 'High',
            'badge_color': 'blue',
            'co2_reduction_mt': round(co2_saved, 1),
            'cost_savings_usd': int(dollar_saved),
            'payback_period_years': 1.4,
            'description': f'Equipment efficiency rating ({equip_rating:.1f}/5.0) indicates significant motor thermal losses. VFD integration reduces parasitic idle load by up to 35%.'
        })
        total_est_reduction_mt += co2_saved
        total_est_cost_savings_usd += dollar_saved

    # 3. Peak Demand Management and Storage
    if peak_factor > 0.62:
        peak_savings = (monthly_kwh * 0.12) * 12 * 0.15
        co2_saved = (peak_savings * 0.55) / 1000.0
        dollar_saved = monthly_kwh * 0.25 * 12 * 0.08
        
        recs.append({
            'id': 'rec_peak_shaving',
            'title': 'AI Automated Peak Load Shaving and Battery Energy Storage (BESS)',
            'timeframe': 'Strategic (6 - 18 months)',
            'category': 'Grid Flexibility',
            'impact_level': 'High',
            'badge_color': 'amber',
            'co2_reduction_mt': round(co2_saved, 1),
            'cost_savings_usd': int(dollar_saved),
            'payback_period_years': 2.1,
            'description': f'Peak load factor ({peak_factor:.2f}) triggers elevated utility demand charges. Smart peak clipping shifts heavy consumption cycles to off-peak green hours.'
        })
        total_est_reduction_mt += co2_saved
        total_est_cost_savings_usd += dollar_saved

    # 4. Circular Waste Diversion
    if waste_pct < 70:
        waste_co2 = annual_carbon_mt * 0.08
        waste_dollar = 4800 + (100 - waste_pct) * 80
        recs.append({
            'id': 'rec_circular_waste',
            'title': 'Implement Zero-Waste-to-Landfill Upcycling and Material Recovery',
            'timeframe': 'Quick Win (< 6 months)',
            'category': 'Scope 3 Circularity',
            'impact_level': 'Medium',
            'badge_color': 'teal',
            'co2_reduction_mt': round(waste_co2, 1),
            'cost_savings_usd': int(waste_dollar),
            'payback_period_years': 0.8,
            'description': f'Recycling rate ({waste_pct:.1f}%) leaves high residual volume. Diverting solid waste to certified recycling partners drastically lowers landfill methane levies.'
        })
        total_est_reduction_mt += waste_co2
        total_est_cost_savings_usd += waste_dollar

    # 5. Logistics Fleet Electrification
    if fuel_liters > 1500:
        fuel_saved_liters = fuel_liters * 12 * 0.40
        co2_saved = (fuel_saved_liters * 2.68) / 1000.0
        dollar_saved = fuel_saved_liters * 1.15
        recs.append({
            'id': 'rec_fleet_ev',
            'title': 'Transition Last-Mile Logistics to Commercial Electric Vehicles (EVs)',
            'timeframe': 'Long-term (> 18 months)',
            'category': 'Scope 1 Fleet',
            'impact_level': 'High',
            'badge_color': 'violet',
            'co2_reduction_mt': round(co2_saved, 1),
            'cost_savings_usd': int(dollar_saved),
            'payback_period_years': 3.2,
            'description': f'Monthly fuel combustion ({fuel_liters:,.0f} L) represents a direct Scope 1 liability. Fleet electrification slashes fuel costs and tailpipe emissions.'
        })
        total_est_reduction_mt += co2_saved
        total_est_cost_savings_usd += dollar_saved

    # 6. Water Recycling and Micro-Telemetry
    if water_m3 > 400 or len(recs) < 3:
        water_co2 = (water_m3 * 12 * 0.25 * 0.35) / 1000.0
        dollar_saved = (water_m3 * 12 * 0.25) * 2.40
        recs.append({
            'id': 'rec_water_telemetry',
            'title': 'Deploy Ultrasonic Smart Water Sub-metering and Closed-Loop Chillers',
            'timeframe': 'Quick Win (< 6 months)',
            'category': 'Resource Conservation',
            'impact_level': 'Medium',
            'badge_color': 'cyan',
            'co2_reduction_mt': round(water_co2, 1),
            'cost_savings_usd': int(dollar_saved),
            'payback_period_years': 1.2,
            'description': 'Continuous acoustic leak detection and greywater treatment loops trim municipal intake and associated sewage processing tariffs.'
        })
        total_est_reduction_mt += water_co2
        total_est_cost_savings_usd += dollar_saved

    impact_rank = {'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1}
    recs.sort(key=lambda r: impact_rank.get(r['impact_level'], 0), reverse=True)

    tier_progression = {
        'High Risk (Tier D)': 'Moderate (Tier C)',
        'Moderate (Tier C)': 'Efficient (Tier B)',
        'Efficient (Tier B)': 'Leader (Tier A)',
        'Leader (Tier A)': 'Net-Zero Exemplar (Tier A+)'
    }
    projected_tier = tier_progression.get(predicted_tier, 'Leader (Tier A)')
    
    pct_reduction = 0.0
    if annual_carbon_mt > 0:
        pct_reduction = round((total_est_reduction_mt / annual_carbon_mt) * 100.0, 1)
        pct_reduction = min(pct_reduction, 78.5)

    return {
        'recommendations': recs,
        'summary': {
            'total_co2_reduction_mt': round(total_est_reduction_mt, 1),
            'total_cost_savings_usd': int(total_est_cost_savings_usd),
            'carbon_reduction_pct': pct_reduction,
            'projected_tier': projected_tier
        }
    }
