import axios from "axios";

const baseURL: string = "https://exercisedb.p.rapidapi.com";

const apiCall = async (url: string, params: any) => {
    try{
        const options = {
            method: 'GET',
            url,
            params: {
                limit: '10',
                offset: '0'
            },
            headers: {
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
                'x-rapidapi-key': '9d61c1fabfmsh4f612f06e4c984dp1efbc7jsnd5661c85a354'
            }
        }
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const fetchExercicesByBodyPart = async (bodyPart: string) => {
    console.log('bodyPart:', bodyPart);
    let data = await apiCall(`${baseURL}/exercises/bodyPart/${bodyPart}`, {});
    return data;
}
