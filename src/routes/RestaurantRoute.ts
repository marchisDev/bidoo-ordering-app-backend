import express from 'express';
import { param } from 'express-validator';
import RestaurantController from '../controllers/RestaurantController';

const router = express.Router();

router.get('/:restaurantId', 
    param('city')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('RestaurantId parameter must be a string and not empty'),
    RestaurantController.getRestaurant
);

router.get('/search/:city', 
    param('city')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('City parameter must be a string and not empty'),
    RestaurantController.searchRestaurants
);

export default router;