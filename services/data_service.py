import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'sustainability_data.csv')

class DataService:
    def __init__(self):
        self.df = None
        self.load_data()

    def load_data(self):
        if os.path.exists(DATA_PATH):
            try:
                self.df = pd.read_csv(DATA_PATH)
                print(f'[DataService] Loaded dataset: {len(self.df)} records, {len(self.df.columns)} columns.')
            except Exception as e:
                print(f'[DataService] Failed to load dataset: {e}')
                self.df = pd.DataFrame()
        else:
            print(f'[DataService] Dataset not found at {DATA_PATH}')
            self.df = pd.DataFrame()

    def get_overview(self):
        if self.df is None or self.df.empty:
            return {'error': 'No dataset loaded'}

        total_records = len(self.df)
        total_features = len(self.df.columns)
        missing_count = int(self.df.isnull().sum().sum())
        
        missing_per_col = {col: int(self.df[col].isnull().sum()) for col in self.df.columns}

        # Statistical summary for numeric cols
        num_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        desc = self.df[num_cols].describe().to_dict()
        stats = {}
        for col in num_cols:
            stats[col] = {
                'min': round(desc[col]['min'], 2),
                'max': round(desc[col]['max'], 2),
                'mean': round(desc[col]['mean'], 2),
                'std': round(desc[col]['std'], 2)
            }

        # Distributions
        tier_counts = self.df['sustainability_tier'].value_counts().to_dict() if 'sustainability_tier' in self.df.columns else {}
        facility_counts = self.df['facility_type'].value_counts().to_dict() if 'facility_type' in self.df.columns else {}

        return {
            'total_records': total_records,
            'total_features': total_features,
            'missing_values_total': missing_count,
            'missing_values_per_feature': missing_per_col,
            'feature_names': list(self.df.columns),
            'numeric_summary': stats,
            'tier_distribution': tier_counts,
            'facility_distribution': facility_counts
        }

    def get_paginated_sample(self, page=1, per_page=15, search='', sort_by=None, sort_dir='asc'):
        if self.df is None or self.df.empty:
            return {'records': [], 'total': 0, 'page': page, 'pages': 0}

        filtered = self.df.copy()

        if search:
            search = str(search).lower()
            mask = filtered.astype(str).apply(lambda row: row.str.lower().str.contains(search).any(), axis=1)
            filtered = filtered[mask]

        if sort_by and sort_by in filtered.columns:
            ascending = (sort_dir.lower() == 'asc')
            filtered = filtered.sort_values(by=sort_by, ascending=ascending)

        total = len(filtered)
        pages = max(1, (total + per_page - 1) // per_page)
        page = max(1, min(page, pages))

        start = (page - 1) * per_page
        end = start + per_page

        slice_df = filtered.iloc[start:end]
        records = slice_df.to_dict(orient='records')

        return {
            'records': records,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': pages
        }

    def get_distributions(self):
        if self.df is None or self.df.empty:
            return {}

        def make_histogram(series, bins=10):
            counts, bin_edges = np.histogram(series.dropna(), bins=bins)
            labels = [f'{int(bin_edges[i])}-{int(bin_edges[i+1])}' for i in range(len(counts))]
            return {
                'labels': labels,
                'counts': counts.tolist()
            }

        return {
            'renewable_pct': make_histogram(self.df['renewable_energy_pct'], bins=8),
            'carbon_footprint': make_histogram(self.df['annual_carbon_footprint_mt'], bins=8),
            'monthly_energy': make_histogram(self.df['monthly_energy_kwh'] / 1000.0, bins=8),
            'tier_distribution': {
                'labels': list(self.df['sustainability_tier'].value_counts().index),
                'counts': self.df['sustainability_tier'].value_counts().tolist()
            }
        }

data_service = DataService()
