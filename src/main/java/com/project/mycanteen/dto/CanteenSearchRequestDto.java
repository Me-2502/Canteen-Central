package com.project.mycanteen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanteenSearchRequestDto {
    private String keyword;
    private String city;
    private String sortBy;
    private Integer page;
    private Integer size;
}
