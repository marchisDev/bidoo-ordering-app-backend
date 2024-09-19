import { Request, Response } from "express"
import Restaurant from "../models/restaurant"

const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId

        const restaurant = await Restaurant.findById(restaurantId)
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' })
        }

        res.json(restaurant)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' })
    }
}


const searchRestaurants = async (req: Request, res: Response) => {
    try {
        const city = req.params.city

        const searchQuery = (req.query.searchQuery as string) || ''
        const selectedCuisines = (req.query.selectedCuisines as string) || ''
        const sortOption = (req.query.sortOption as string) || 'lastUpdated'
        const page = parseInt(req.query.page as string) || 1

        let query: any = {}

        // london = London, khong phan biet chu hoa/chu thuong
        query['city'] = new RegExp(city, 'i')
        const cityCheck = await Restaurant.countDocuments(query)
        if (cityCheck === 0) {
            return res.status(404).json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1,
                }
            })
        }

        if (selectedCuisines) {
            // URL = selectedCuisines = 'chinese,indian,bugger'
            const cuisineArray = selectedCuisines
                .split(',') // ['chinese', 'indian', 'bugger']
                .map((cuisine) => new RegExp(cuisine, 'i'))

            query['cuisines'] = { $all: cuisineArray }
        }

        if (searchQuery) {
            // restaurantName = Pizza Plaza
            // cuisines = ['chinese', 'pasta', 'bugger']
            // serachQuery = 'Pasta'
            const searchRegex = new RegExp(searchQuery, 'i')

            query['$or'] = [
                { 'restaurantName': searchRegex },
                { 'cuisines': { $in: [searchRegex] } },
                { 'menuItems': searchRegex }
            ]
        }

        const pageSize = 10 // 10 elements per page
        const skip = (page - 1) * pageSize // page 2 = (2-1)*10 = 10 skip 10 elements

        const restaurants = await Restaurant
            .find(query)
            .sort({ [sortOption]: 1 })
            .skip(skip)
            .limit(pageSize)
            .lean()

        const total = await Restaurant.countDocuments(query)

        const response = {
            data: restaurants,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / pageSize)
            }
        }

        res.json(response)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong', error })
    }
}

export default { 
    getRestaurant,
    searchRestaurants 
}