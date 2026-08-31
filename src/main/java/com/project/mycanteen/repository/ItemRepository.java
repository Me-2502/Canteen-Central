package com.project.mycanteen.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.mycanteen.entity.Item;

public interface ItemRepository extends JpaRepository<Item, UUID> {

}
