import axios from 'axios'
import cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { join } from 'path'
import { ScraperError } from '../utils'

interface Ijadwal { value: string; kota: string; }
interface IresjadwalSholat {
    date: string;
    today: {
        [Key: string]: string;
    };
    list: {
        date: string;
        imsyak: string;
        shubuh: string;
        terbit: string;
        dhuha: string;
        dzuhur: string;
        ashr: string;
        magrib: string;
        isyak: string;
    }[]
}
export const listJadwalSholat: Ijadwal[] = JSON.parse(readFileSync(join(__dirname, '../../data/jadwal-sholat.json'), 'utf-8'))
export default async function jadwalsholat(kota: string): Promise<IresjadwalSholat> {
    let jadwal: Ijadwal
    if (!(jadwal = listJadwalSholat.find(({ kota: Kota }) => (new RegExp(Kota, 'ig').test(kota))))) throw new ScraperError('List kota ' + listJadwalSholat.map(({ kota }) => kota))
    const { data: today } = await axios.get<string>(`https://www.jadwalsholat.org/adzan/ajax/ajax.daily1.php?id=${jadwal.value}`)
    let sholatToday: IresjadwalSholat['today'] = {}
    const $ = cheerio.load(today)
    $('table > tbody > tr').filter('.table_light, .table_dark').each(function () {
        const el = $(this).find('td')
        const sholat = el.eq(0).text()
        const time = el.eq(1).text()
        sholatToday[sholat] = time
    })
    const { data } = await axios.get<string>(`https://jadwalsholat.org/jadwal-sholat/monthly.php?id=${jadwal.value}`)
    const list: IresjadwalSholat['list'] = []
    const $$ = cheerio.load(data)
    $$('table.table_adzan > tbody > tr').filter('.table_light, .table_dark').each(function () {
        const el = $$(this).find('td')
        const date = el.eq(0).text().trim()
        const imsyak = el.eq(1).text().trim()
        const shubuh = el.eq(2).text().trim()
        const terbit = el.eq(3).text().trim()
        const dhuha = el.eq(4).text().trim()
        const dzuhur = el.eq(5).text().trim()
        const ashr = el.eq(6).text().trim()
        const magrib = el.eq(7).text().trim()
        const isyak = el.eq(8).text().trim()
        list.push({ date, imsyak, shubuh, terbit, dhuha, dzuhur, ashr, magrib, isyak })
    })
    return {
        date: $$('tr.table_title > td > h2.h2_edit').text().trim(),
        today: sholatToday,
        list
    }
}