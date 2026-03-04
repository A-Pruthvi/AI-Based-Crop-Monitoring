package com.drone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionStatsResponse {

    private Long totalScans;
    private Long healthyCount;
    private Long diseasedCount;
    private Long alertsCount;
    private Double healthyPercentage;
    private Double diseasedPercentage;

    public static PredictionStatsResponse create(Long total, Long healthy, Long diseased, Long alerts) {
        double healthyPct = total > 0 ? (healthy * 100.0) / total : 0;
        double diseasedPct = total > 0 ? (diseased * 100.0) / total : 0;

        return PredictionStatsResponse.builder()
                .totalScans(total)
                .healthyCount(healthy)
                .diseasedCount(diseased)
                .alertsCount(alerts)
                .healthyPercentage(Math.round(healthyPct * 10.0) / 10.0)
                .diseasedPercentage(Math.round(diseasedPct * 10.0) / 10.0)
                .build();
    }
}
