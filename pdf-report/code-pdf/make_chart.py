"""Horizontal bar chart: game source files by line count (charts.md compliant)."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

files = [
    ('lib/game/events.ts', 1111),
    ('scene/BaseScene.tsx', 688),
    ('lib/game/engine.ts', 314),
    ('app/globals.css', 277),
    ('components/game/Game.tsx', 249),
    ('components/game/Debrief.tsx', 229),
    ('components/game/Hud.tsx', 192),
    ('components/game/EnergyAllocator.tsx', 181),
    ('hooks/use-game.ts', 177),
    ('components/game/MissionPanels.tsx', 151),
]
files = files[::-1]  # smallest at bottom for horizontal bars

labels = [f[0] for f in files]
values = [f[1] for f in files]

ACCENT = '#3681a6'
TEXT_PRIMARY = '#1a1b1c'
TEXT_MUTED = '#6f7578'
BORDER = '#b8c8cf'

fig, ax = plt.subplots(figsize=(8.0, 4.4), dpi=200)
bars = ax.barh(labels, values, color=ACCENT, height=0.62, edgecolor='none', zorder=3)

# Value labels at bar ends (grid deleted entirely per charts.md when values shown)
for bar, v in zip(bars, values):
    ax.text(v + 14, bar.get_y() + bar.get_height() / 2, str(v),
            va='center', ha='left', fontsize=9.5, color=TEXT_PRIMARY)

ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_visible(False)
ax.spines['bottom'].set_color(BORDER)
ax.spines['bottom'].set_linewidth(0.8)
ax.tick_params(axis='y', length=0, labelsize=9.5, colors=TEXT_PRIMARY)
ax.tick_params(axis='x', length=3, labelsize=9, colors=TEXT_MUTED)
ax.set_xlim(0, 1240)
ax.set_xlabel('lines of code', fontsize=9.5, color=TEXT_MUTED)
ax.margins(y=0.02)

fig.tight_layout(pad=1.4)
fig.savefig('/home/z/my-project/pdf-report/code-pdf/chart_files.png', dpi=200,
            bbox_inches='tight', facecolor='white')
print('chart saved')
