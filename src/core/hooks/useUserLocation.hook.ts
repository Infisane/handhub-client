import { useEffect } from "react";
import { useGeolocated } from "react-geolocated";
import { set_geolocation } from "#/core/redux-store/slices/geolocation.slice";
import { useAppDispatch } from "./useStore.hook";

export const useUserLocation = () => {
	const dispatch = useAppDispatch();

	const { coords, isGeolocationAvailable, positionError } = useGeolocated({
		positionOptions: {
			timeout: 10000,
			maximumAge: 1000 * 60 * 30,
		},
		watchPosition: true,
		suppressLocationOnMount: false,
	});

	useEffect(() => {
		if (!isGeolocationAvailable) {
			dispatch(set_geolocation({ status: "unavailable" }));
			return;
		}
		if (coords) {
			dispatch(
				set_geolocation({
					latitude: coords.latitude,
					longitude: coords.longitude,
					accuracy: coords.accuracy,
					status: "granted",
				}),
			);
			return;
		}
		if (positionError) {
			dispatch(
				set_geolocation({
					status:
						positionError.code === positionError.PERMISSION_DENIED
							? "denied"
							: "unavailable",
				}),
			);
			return;
		}
		dispatch(set_geolocation({ status: "loading" }));
	}, [coords, isGeolocationAvailable, positionError, dispatch]);
};
